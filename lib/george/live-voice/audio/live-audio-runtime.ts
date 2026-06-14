import {
  createDeepgramLiveClient,
  type DeepgramLiveClient,
} from '../stt/deepgram-live-client'

export type LiveAudioRuntimeStatus =
  | 'idle'
  | 'starting'
  | 'listening'
  | 'stopped'
  | 'error'

export type LiveAudioRuntimeHandlers = {
  onStatus?: (status: LiveAudioRuntimeStatus) => void
  onPartialTranscript?: (text: string) => void
  onFinalTranscript?: (text: string) => void
  onError?: (error: unknown) => void
}

export type LiveAudioRuntime = {
  start: () => Promise<void>
  stop: () => void
  getStatus: () => LiveAudioRuntimeStatus
}

export function createLiveAudioRuntime(
  handlers: LiveAudioRuntimeHandlers
): LiveAudioRuntime {
  let status: LiveAudioRuntimeStatus = 'idle'
  let sttClient: DeepgramLiveClient | null = null

  function setStatus(next: LiveAudioRuntimeStatus) {
    status = next
    handlers.onStatus?.(next)
  }

  async function start() {
    if (status === 'starting' || status === 'listening') return

    setStatus('starting')

    sttClient = createDeepgramLiveClient({
      onOpen: () => setStatus('listening'),
      onPartial: (text) => handlers.onPartialTranscript?.(text),
      onFinal: (text) => handlers.onFinalTranscript?.(text),
      onError: (error) => {
        setStatus('error')
        handlers.onError?.(error)
      },
      onClose: () => {
        if (status !== 'stopped') setStatus('idle')
      },
    })

    try {
      await sttClient.start()
    } catch (error) {
      setStatus('error')
      handlers.onError?.(error)
    }
  }

  function stop() {
    setStatus('stopped')
    sttClient?.stop()
    sttClient = null
  }

  function getStatus() {
    return status
  }

  return {
    start,
    stop,
    getStatus,
  }
}
