import type { GeorgeLiveDeliveryStyle } from './types'

export type LiveVoiceSpeedPolicyInput = {
  deliveryStyle?: GeorgeLiveDeliveryStyle | string
  text?: string
  receiverProfile?: 'visual_only' | 'audio_visual' | 'audio_only'
  pressure?: 'low' | 'medium' | 'high'
  userRequestedSlowdown?: boolean
  userRequestedRepeat?: boolean
}

export type LiveVoiceSpeedPolicy = {
  speed: number
  reason: string
}

function wordCount(text = '') {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function determineLiveVoiceSpeed(input: LiveVoiceSpeedPolicyInput): LiveVoiceSpeedPolicy {
  const deliveryStyle = input.deliveryStyle || 'advice'
  const words = wordCount(input.text)

  if (input.userRequestedSlowdown || input.userRequestedRepeat) {
    return {
      speed: 0.96,
      reason: 'User needs synchronization or repetition.',
    }
  }

  if (input.pressure === 'high') {
    return {
      speed: 1.02,
      reason: 'High pressure requires clarity over speed.',
    }
  }

  if (deliveryStyle === 'response') {
    if (words >= 38) {
      return {
        speed: 1.1,
        reason: 'Response mode with longer line should stay repeatable.',
      }
    }

    return {
      speed: 1.16,
      reason: 'Response mode benefits from faster repeatable delivery.',
    }
  }

  if (deliveryStyle === 'continue') {
    return {
      speed: 1.08,
      reason: 'Continuation should preserve user cadence.',
    }
  }

  if (deliveryStyle === 'expandedLine') {
    return {
      speed: 1.02,
      reason: 'Presentation delivery should prioritize clarity.',
    }
  }

  return {
    speed: 1.12,
    reason: 'Cue delivery should be quick and low burden.',
  }
}
