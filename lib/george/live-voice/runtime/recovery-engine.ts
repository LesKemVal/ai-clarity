import { detectConversationSignals } from './conversation-signals'

export type RecoveryState =
  | 'stable'
  | 'overexplaining'
  | 'authority_loss'
  | 'awkward_silence'
  | 'failed_close'
  | 'trust_fracture'
  | 'defensive_spiral'

export type RecoveryInput = {
  text: string
  trajectory?: string
  powerFrame?: string
  emotionalVelocity?: 'stable' | 'rising' | 'spiking'
  interruptionRisk?: number
}

export type RecoveryDecision = {
  state: RecoveryState
  repair: string
  reason: string
  shouldReset: boolean
}

class GeorgeRecoveryEngine {
  detect(input: RecoveryInput): RecoveryDecision {
    const text = input.text.toLowerCase()
    const signals = detectConversationSignals(text)

    if (signals.has('defensive_language')) {
      return {
        state: 'defensive_spiral',
        repair: 'Re-center. Make the next point clean and human.',
        reason: 'User appears trapped in explanation spiral.',
        shouldReset: true,
      }
    }

    if (
      /never mind|forget it|whatever|fine/i.test(text)
    ) {
      return {
        state: 'authority_loss',
        repair: 'Slow down. Reclaim composure before speaking again.',
        reason: 'User may be surrendering frame control.',
        shouldReset: true,
      }
    }

    if (
      input.trajectory === 'resistance_hardening'
    ) {
      return {
        state: 'failed_close',
        repair: 'Redirect instead of pushing harder.',
        reason: 'Close attempt likely failed.',
        shouldReset: false,
      }
    }

    if (
      input.emotionalVelocity === 'spiking' &&
      (input.interruptionRisk || 0) > 0.82
    ) {
      return {
        state: 'trust_fracture',
        repair: 'Reduce pressure. Rebuild trust slowly.',
        reason: 'Room trust may be deteriorating.',
        shouldReset: true,
      }
    }

    if (/\.\.\.|uh|um/i.test(text) || signals.has('interruption_attempt')) {
      return {
        state: 'awkward_silence',
        repair: 'Do not rush to fill silence.',
        reason: 'Silence tension detected.',
        shouldReset: false,
      }
    }

    return {
      state: 'stable',
      repair: 'Maintain trajectory.',
      reason: 'Conversation remains stable.',
      shouldReset: false,
    }
  }
}

export const georgeRecoveryEngine =
  new GeorgeRecoveryEngine()
