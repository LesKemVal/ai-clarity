export type LiveTranscriptProviderStatus =
  | 'idle'
  | 'starting'
  | 'active'
  | 'stopping'
  | 'failed'

export type LiveTranscriptProviderEvent =
  | {
      type: 'partial_transcript'
      text: string
    }
  | {
      type: 'final_transcript'
      text: string
    }
  | {
      type: 'error'
      error: unknown
    }
  | {
      type: 'status'
      status: LiveTranscriptProviderStatus
    }

export type LiveTranscriptProvider = {
  name: string
  start: () => void | Promise<void>
  stop: () => void | Promise<void>
  emergencyStop: () => void | Promise<void>
  getStatus: () => LiveTranscriptProviderStatus
}

export type LiveTranscriptProviderCallbacks = {
  onEvent: (event: LiveTranscriptProviderEvent) => void
}
