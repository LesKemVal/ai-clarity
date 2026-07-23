import type { GeorgeActionCue } from '@/lib/george/live-hub/types'
import type { GeorgeLiveDeliveryStyle } from '@/lib/george/live-contracts'
export type { GeorgeLiveDeliveryStyle } from '@/lib/george/live-contracts'

export type GeorgeDeliveryMode = 'voice' | 'visual' | 'silent'

export type GeorgeLiveReceiverProfile =
  | 'visual_only'
  | 'audio_only'
  | 'audio_visual'

export const DEFAULT_GEORGE_LIVE_DELIVERY_STYLE: GeorgeLiveDeliveryStyle = 'advice'
export const DEFAULT_GEORGE_LIVE_RECEIVER_PROFILE: GeorgeLiveReceiverProfile = 'audio_only'

export type GeorgeDeliveryCue = {
  turnId?: string
  mode: GeorgeDeliveryMode
  text: string
  reason: string
  operationalAssessment?: GeorgeActionCue['operationalAssessment']
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
  receiverProfile?: GeorgeLiveReceiverProfile
  room?: string
  objective?: string
  knownContext?: string
  pressure?: string
}
