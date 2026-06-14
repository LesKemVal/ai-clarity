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

export function createDeepgramLiveClient(handlers: DeepgramLiveClientHandlers): DeepgramLiveClient {
  let socket: WebSocket | null = null
  let stream: MediaStream | null = null
  let recorder: MediaRecorder | null = null
  let audioContext: AudioContext | null = null
  let audioMeterTimer: ReturnType<typeof setInterval> | null = null
  let stopped = false

  async function start() {
    stopped = false

    const tokenRes = await fetch('/api/george/live/stt-token')
    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || !tokenData?.token) {
      throw new Error(tokenData?.error || 'Deepgram token unavailable')
    }

    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    const url =
      'wss://api.deepgram.com/v1/listen' +
      '?model=nova-2' +
      '&interim_results=true' +
      '&smart_format=true' +
      '&punctuate=true' +
      '&endpointing=350'

    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      console.log('[GEORGE DEEPGRAM] audio inputs', devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({ label: device.label, deviceId: device.deviceId })))
    } catch {}

    try {
      audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)

      const data = new Uint8Array(analyser.fftSize)

      audioMeterTimer = setInterval(() => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (const value of data) {
          const centered = value - 128
          sum += centered * centered
        }
        const rms = Math.sqrt(sum / data.length)
        console.log('[GEORGE DEEPGRAM] mic level', { rms: Number(rms.toFixed(2)) })
      }, 1000)
    } catch (error) {
      console.log('[GEORGE DEEPGRAM] mic meter failed', error)
    }

    socket = new WebSocket(url, ['token', tokenData.token])

    socket.onopen = () => {
      console.log('[GEORGE DEEPGRAM] websocket open')
      handlers.onOpen?.()

      recorder = new MediaRecorder(stream as MediaStream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })

      console.log('[GEORGE DEEPGRAM] mime', recorder.mimeType)

      recorder.ondataavailable = (event) => {
        if (!event.data?.size) return
        if (!socket || socket.readyState !== WebSocket.OPEN) return
        console.log('[GEORGE DEEPGRAM] audio chunk', { size: event.data.size })
        socket.send(event.data)
      }

      console.log('[GEORGE DEEPGRAM] recorder start', { mimeType: recorder.mimeType })
      recorder.start(250)
    }

    socket.onmessage = (message) => {
      console.log('[GEORGE DEEPGRAM] message', message.data)
      try {
        const payload = JSON.parse(String(message.data))
        const transcript =
          payload?.channel?.alternatives?.[0]?.transcript ||
          payload?.channel?.alternatives?.[0]?.words?.map((word: any) => word?.word).filter(Boolean).join(' ') ||
          ''

        if (!transcript.trim()) return

        if (payload?.is_final || payload?.speech_final) {
          handlers.onFinal?.(transcript.trim())
        } else {
          handlers.onPartial?.(transcript.trim())
        }
      } catch (error) {
        handlers.onError?.(error)
      }
    }

    socket.onerror = (error) => {
      console.log('[GEORGE DEEPGRAM] websocket error', error)
      handlers.onError?.(error)
    }

    socket.onclose = (event) => {
      console.log('[GEORGE DEEPGRAM] websocket close', { code: event.code, reason: event.reason })
      if (!stopped) handlers.onClose?.()
    }
  }

  function stop() {
    stopped = true

    try {
      recorder?.stop()
    } catch {}

    try {
      socket?.close()
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
  }

  return { start, stop }
}
