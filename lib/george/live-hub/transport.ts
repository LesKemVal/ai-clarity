import type { GeorgeLiveHubContext, GeorgeLiveHubEvent } from './types'

export type GeorgeLiveHubTransport = {
  connect: (context?: GeorgeLiveHubContext) => void
  sendAudio: (audio: ArrayBuffer) => void
  sendJson?: (message: Record<string, unknown>) => void
  syncContext?: (context?: GeorgeLiveHubContext) => void
  close: () => void
}

export type GeorgeLiveHubTransportHandlers = {
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: string) => void
  onEvent?: (event: GeorgeLiveHubEvent) => void
}
