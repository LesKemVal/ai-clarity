export type LiveHubContext = {
  room?: string
  chair?: string
  objective?: string
  knownContext?: string
  userPosition?: string
}

export type ClientMessage =
  | { type: 'SYNC_CONTEXT'; context: LiveHubContext }
  | { type: 'PING'; at?: number }

export type ServerMessage =
  | { type: 'READY'; at: number }
  | { type: 'PONG'; at: number }
  | { type: 'TRANSCRIPT_PARTIAL'; text: string; at: number }
  | { type: 'TRANSCRIPT_FINAL'; text: string; at: number }
  | {
      type: 'LOCAL_CUE'
      cue: string
      reason: string
      category?: string
      confidence?: number
      priority?: number
      packet?: {
        transcript: string
        isFinal: boolean
        signal: string
        pressure: string
        objective: string
        cue: string
        reason: string
        category: string
        confidence: number
        priority: number
        source: 'local'
        at: number
      }
      at: number
    }
  | {
      type: 'FAST_CUE'
      cue: string
      source: 'groq'
      model: string
      fromLocalCue: string
      at: number
    }
  | {
      type: 'ACTION_CUE'
      cue: string
      reason: string
      source: 'local' | 'groq'
      localCue: string
      fastCue?: string
      category: string
      confidence: number
      priority: number
      at: number
    }
  | { type: 'ERROR'; error: string; at: number }
