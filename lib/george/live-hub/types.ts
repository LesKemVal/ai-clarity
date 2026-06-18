export type GeorgeActionCue = {
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

export type GeorgeLiveHubContext = {
  room?: string
  chair?: string
  objective?: string
  knownContext?: string
  userPosition?: string
}

export type GeorgeLiveHubEvent =
  | ({ type: 'ACTION_CUE' } & GeorgeActionCue)
  | { type: 'READY'; at: number }
  | { type: 'ERROR'; error: string; at: number }
  | Record<string, unknown>
