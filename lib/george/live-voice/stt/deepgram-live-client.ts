import { markRuntimeEvent, startRuntimeTurn } from '@/lib/george/live-metrics/runtime-metrics'
function liveSttDebug() {
  return typeof window !== 'undefined' &&
    window.localStorage.getItem('george_live_debug') === '1'
}

export type DeepgramLiveClientHandlers = {
  onOpen?: () => void
  onPartial?: (text: string) => void
  onFinal?: (text: string) => void
  onError?: (error: unknown) => void
  onClose?: () => void
}

export type DeepgramLiveClient = {
  start: () => Promise<void>
  stop: () => void
}


function cleanSttText(value: unknown) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function isLikelyIncompleteSttUtterance(value: string) {
  const clean = cleanSttText(value)
  if (!clean) return false
  if (/[.!?][”"]?$/.test(clean)) return false

  const lower = clean.toLowerCase()

  if (/^(how can we be confident|how can we know|how do we know|why should an enterprise|why should we|what makes george|what makes GEORGE|what makes this|if every company|how does george scale|how does GEORGE scale)\b/i.test(clean)) {
    return true
  }

  if (/\b(and|but|because|so|which|that|what|why|how|when|where|who|must|should|can|could|would|will|to|for|about|with|the|a|an|most|single|point|in|of|confident|instead|different)$/i.test(lower)) {
    return true
  }

  if (/\b(what is the|what's the|based on|given everything|in the first|i need to|i must|i should)$/i.test(lower)) {
    return true
  }

  return clean.split(/\s+/).length >= 8 && !/[.!?]/.test(clean)
}

function mergeSttUtterance(previous: string, next: string) {
  const left = cleanSttText(previous)
  const right = cleanSttText(next)
  if (!left) return right
  if (!right) return left
  return `${left} ${right}`.replace(/\s+/g, ' ').trim()
}

export function createDeepgramLiveClient(handlers: DeepgramLiveClientHandlers): DeepgramLiveClient {
  let socket: WebSocket | null = null
  let stream: MediaStream | null = null
  let recorder: MediaRecorder | null = null
  let audioContext: AudioContext | null = null
  let audioMeterTimer: ReturnType<typeof setInterval> | null = null
  let stopped = false
  let currentTurnId = ''
  let sentFirstAudioChunk = false
    let pendingFinalTranscript = ''

  function nextTurnId() {
    return `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  function ensureTurnId() {
    if (!currentTurnId) {
      currentTurnId = nextTurnId()
      startRuntimeTurn(currentTurnId)
    }
    return currentTurnId
  }


  const globalStopKey = '__GEORGE_DEEPGRAM_STOPPERS__'

  function registerGlobalStopper() {
    if (typeof window === 'undefined') return

    const store = window as any
    if (!Array.isArray(store[globalStopKey])) {
      store[globalStopKey] = []
    }

    if (!store[globalStopKey].includes(stop)) {
      store[globalStopKey].push(stop)
    }
  }

  function unregisterGlobalStopper() {
    if (typeof window === 'undefined') return

    const store = window as any
    if (Array.isArray(store[globalStopKey])) {
      store[globalStopKey] = store[globalStopKey].filter((fn: unknown) => fn !== stop)
    }
  }

  async function start() {
    if (liveSttDebug()) console.info('[GEORGE DEEPGRAM] start called')
    stopped = false
    registerGlobalStopper()

    const storedEmail =
      typeof window !== 'undefined'
        ? (
            window.localStorage.getItem('george_email') ||
            window.localStorage.getItem('george_user_email') ||
            window.localStorage.getItem('continuity_email') ||
            ''
          ).trim()
        : ''

    const tokenUrl = storedEmail
      ? `/api/george/live/stt-token?email=${encodeURIComponent(storedEmail)}`
      : '/api/george/live/stt-token'

    if (liveSttDebug()) console.info('[GEORGE DEEPGRAM] token request', { tokenUrl })

    const tokenRes = await fetch(tokenUrl)
    const tokenData = await tokenRes.json()

    if (liveSttDebug()) {
      console.info('[GEORGE DEEPGRAM] token response', {
        ok: tokenRes.ok,
        status: tokenRes.status,
        hasToken: Boolean(tokenData?.token),
        fallback: Boolean(tokenData?.directKeyFallback),
        error: tokenData?.error || null,
      })
    }

    if (!tokenRes.ok || !tokenData?.token) {
      throw new Error(tokenData?.error || 'Deepgram token unavailable')
    }

    if (liveSttDebug()) console.info('[GEORGE DEEPGRAM] requesting mic')
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    currentTurnId = nextTurnId()
    sentFirstAudioChunk = false
    startRuntimeTurn(currentTurnId)
    markRuntimeEvent(currentTurnId, 'mic_open')

    if (stopped) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
      return
    }

    const url =
      'wss://api.deepgram.com/v1/listen' +
      '?model=nova-2' +
      '&interim_results=true' +
      '&smart_format=true' +
      '&punctuate=true' +
      '&endpointing=350'

    try {
      await navigator.mediaDevices.enumerateDevices()
    } catch {}

    try {
      audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)

      const data = new Uint8Array(analyser.fftSize)

      audioMeterTimer = setInterval(() => {
        if (stopped) {
          if (audioMeterTimer) clearInterval(audioMeterTimer)
          audioMeterTimer = null
          return
        }

        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (const value of data) {
          const centered = value - 128
          sum += centered * centered
        }
        const rms = Math.sqrt(sum / data.length)
      }, 1000)
    } catch (error) {
      console.warn('[GEORGE DEEPGRAM] mic meter failed', error)
    }

    if (stopped) return

    if (liveSttDebug()) console.info('[GEORGE DEEPGRAM] opening websocket')
    socket = new WebSocket(url, ['token', tokenData.token])

    socket.onopen = () => {
      if (stopped) {
        try { socket?.close() } catch {}
        return
      }

      if (liveSttDebug()) console.info('[GEORGE DEEPGRAM] websocket open')
      handlers.onOpen?.()

      recorder = new MediaRecorder(stream as MediaStream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })


      recorder.ondataavailable = (event) => {
        if (stopped) return
        if (!event.data?.size) return
        if (!socket || socket.readyState !== WebSocket.OPEN) return
        const turnId = ensureTurnId()
        if (!sentFirstAudioChunk) {
          sentFirstAudioChunk = true
          markRuntimeEvent(turnId, 'first_audio_chunk_sent')
        }
        if (liveSttDebug()) console.info('[GEORGE DEEPGRAM] audio chunk', { size: event.data.size })
        socket.send(event.data)
      }

      if (liveSttDebug()) console.info('[GEORGE DEEPGRAM] recorder start', { mimeType: recorder.mimeType })
      recorder.start(250)
    }

    socket.onmessage = (message) => {
      try {
        const payload = JSON.parse(String(message.data))
        const transcript =
          payload?.channel?.alternatives?.[0]?.transcript ||
          payload?.channel?.alternatives?.[0]?.words?.map((word: any) => word?.word).filter(Boolean).join(' ') ||
          ''

        if (!transcript.trim()) return

        const turnId = ensureTurnId()

        if (payload?.is_final || payload?.speech_final) {
          markRuntimeEvent(turnId, 'deepgram_final')

          const assembledTranscript = mergeSttUtterance(pendingFinalTranscript, transcript)

          if (isLikelyIncompleteSttUtterance(assembledTranscript)) {
            pendingFinalTranscript = assembledTranscript
            if (liveSttDebug()) {
              console.info('[GEORGE DEEPGRAM] final held for utterance assembly', {
                transcript: assembledTranscript,
              })
            }
            return
          }

          pendingFinalTranscript = ''
          handlers.onFinal?.(assembledTranscript)
          currentTurnId = nextTurnId()
          sentFirstAudioChunk = false
          startRuntimeTurn(currentTurnId)
        } else {
          markRuntimeEvent(turnId, 'deepgram_interim')
          handlers.onPartial?.(transcript.trim())
        }
      } catch (error) {
        handlers.onError?.(error)
      }
    }

    socket.onerror = (error) => {
      console.warn('[GEORGE DEEPGRAM] websocket error', error)
      handlers.onError?.(error)
    }

    socket.onclose = (event) => {
      console.warn('[GEORGE DEEPGRAM] websocket close', { code: event.code, reason: event.reason, stopped })
      if (!stopped) handlers.onClose?.()
    }
  }

  function stop() {
    stopped = true

    try {
      if (recorder) {
        recorder.ondataavailable = null
        recorder.stop()
      }
    } catch {}

    try {
      if (socket) {
        socket.onmessage = null
        socket.onopen = null
        socket.onerror = null
        socket.onclose = null
        socket.close()
      }
    } catch {}

    try {
      if (audioMeterTimer) clearInterval(audioMeterTimer)
      audioMeterTimer = null
    } catch {}

    try {
      audioContext?.close()
    } catch {}

    try {
      stream?.getTracks().forEach((track) => track.stop())
    } catch {}

    recorder = null
    socket = null
    stream = null
    audioContext = null

    unregisterGlobalStopper()
  }

  return { start, stop }
}
