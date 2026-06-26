export type LiveHubDeliveryStyle =
  | 'silent'
  | 'cue'
  | 'advice'
  | 'line'
  | 'response'
  | 'expandedLine'
  | 'continue'

export type LiveHubContext = {
  room?: string
  chair?: string
  objective?: string
  knownContext?: string
  secondaryOutcome?: string
  secondaryObjective?: string
  intangibleObjective?: string
  userPosition?: string
  deliveryStyle?: LiveHubDeliveryStyle
}

export type ClientMessage =
  | { type: 'SYNC_CONTEXT'; context: LiveHubContext }
  | { type: 'TRANSCRIPT_INPUT'; text: string; isFinal?: boolean; turnId?: string; deliveryStyle?: LiveHubDeliveryStyle }
  | { type: 'PING'; at?: number }

export type ServerMessage =
  | { type: 'READY'; at: number }
  | { type: 'PONG'; at: number }
  | { type: 'TRANSCRIPT_PARTIAL'; text: string; source?: 'deepgram' | 'client'; at: number }
  | { type: 'TRANSCRIPT_FINAL'; text: string; source?: 'deepgram' | 'client'; at: number }
  | {
      type: 'LOCAL_CUE'
      turnId?: string
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
        deliveryStyle?: LiveHubDeliveryStyle
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
      turnId?: string
      cue: string
      reason: string
      source: 'local' | 'groq'
      localCue: string
      fastCue?: string
      evidence?: {
        transcript?: string
        room?: string
        objective?: string
        knownContext?: string
      }
      category: string
      confidence: number
      priority: number
      at: number
    }
  | { type: 'ERROR'; error: string; at: number }
