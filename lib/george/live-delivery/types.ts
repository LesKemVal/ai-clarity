import type { GeorgeActionCue } from '@/lib/george/live-hub/types'

export type GeorgeDeliveryMode = 'voice' | 'visual' | 'silent'

export type GeorgeLiveDeliveryStyle =
  | 'silent'
  | 'cue'
  | 'advice'
  | 'line'
  | 'response'
  | 'expandedLine'
  | 'continue'

export const DEFAULT_GEORGE_LIVE_DELIVERY_STYLE: GeorgeLiveDeliveryStyle = 'advice'

export type GeorgeDeliveryCue = {
  mode: GeorgeDeliveryMode
  text: string
  reason: string
  source: GeorgeActionCue['source']
  category: GeorgeActionCue['category']
  deliveryStyle: GeorgeLiveDeliveryStyle
  confidence: number
  priority: number
  at: number
}

export type GeorgeDeliveryContext = {
  voiceEnabled?: boolean
  deliveryStyle?: GeorgeLiveDeliveryStyle
  room?: string
  objective?: string
  knownContext?: string
  pressure?: string
}
