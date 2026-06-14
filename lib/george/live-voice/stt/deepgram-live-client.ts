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
      '&language=en-US' +
      '&interim_results=true' +
      '&smart_format=true' +
      '&punctuate=true' +
      '&endpointing=350'

    socket = new WebSocket(url, ['token', tokenData.token])

    socket.onopen = () => {
      handlers.onOpen?.()

      recorder = new MediaRecorder(stream as MediaStream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })

      recorder.ondataavailable = (event) => {
        if (!event.data?.size) return
        if (!socket || socket.readyState !== WebSocket.OPEN) return
        socket.send(event.data)
      }

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
      handlers.onError?.(error)
    }

    socket.onclose = () => {
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
      stream?.getTracks().forEach((track) => track.stop())
    } catch {}

    recorder = null
    socket = null
    stream = null
  }

  return { start, stop }
}
