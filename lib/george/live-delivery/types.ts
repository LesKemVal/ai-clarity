import type { GeorgeActionCue } from '@/lib/george/live-hub/types'

export type GeorgeDeliveryMode = 'voice' | 'visual' | 'silent'

export type GeorgeDeliveryCue = {
  mode: GeorgeDeliveryMode
  text: string
  reason: string
  source: GeorgeActionCue['source']
  category: GeorgeActionCue['category']
  priority: number
  at: number
}

export type GeorgeDeliveryContext = {
  voiceEnabled?: boolean
  room?: string
  pressure?: string
}
