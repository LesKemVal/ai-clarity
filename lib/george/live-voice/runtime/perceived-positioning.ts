import { detectConversationSignals } from './conversation-signals'

export type PerceivedPositioningState = {
  perception: 'strengthening' | 'stable' | 'weakening' | 'at_risk'
  score: number
  trustMovement: 'rising' | 'stable' | 'falling'
  credibilityMovement: 'rising' | 'stable' | 'falling'
  respectSignal: 'rising' | 'stable' | 'falling'
  reason: string
}

export function assessPerceivedPositioning(input: {
  text: string
  speaker?: string
  powerFrame?: string
  trajectory?: string
  recovery?: string
  emotionalVelocity?: string
  roomPressure?: string
  interruptionRisk?: number
}): PerceivedPositioningState {
  const text = input.text.toLowerCase()
  const signals = detectConversationSignals(text)

  let score = 0.5
  const reasons: string[] = []

  if (input.trajectory === 'positive' || /fair|that makes sense|i understand|sounds good/i.test(text)) {
    score += 0.18
    reasons.push('room receptivity improving')
  }

  if (input.powerFrame === 'user_controls') {
    score += 0.14
    reasons.push('user frame strengthening')
  }

  if (/let me be clear|my position|here is what matters|the important point/i.test(text)) {
    score += 0.1
    reasons.push('clear positioning language detected')
  }

  if (input.recovery === 'defensive_spiral' || signals.has('defensive_language')) {
    score -= 0.18
    reasons.push('defensive language may weaken perception')
  }

  if (input.trajectory === 'resistance_hardening') {
    score -= 0.16
    reasons.push('room resistance hardening')
  }

  if (input.emotionalVelocity === 'spiking') {
    score -= 0.12
    reasons.push('emotional speed increasing')
  }

  if ((input.interruptionRisk || 0) > 0.78) {
    score -= 0.12
    reasons.push('interruption risk high')
  }

  if (input.powerFrame === 'user_defensive') {
    score -= 0.16
    reasons.push('user appears defensive')
  }

  score = Math.max(0, Math.min(1, Number(score.toFixed(2))))

  const perception =
    score >= 0.68
      ? 'strengthening'
      : score >= 0.46
        ? 'stable'
        : score >= 0.32
          ? 'weakening'
          : 'at_risk'

  const trustMovement =
    input.trajectory === 'positive'
      ? 'rising'
      : input.recovery === 'trust_fracture' || input.trajectory === 'resistance_hardening'
        ? 'falling'
        : 'stable'

  const credibilityMovement =
    input.powerFrame === 'user_controls'
      ? 'rising'
      : input.powerFrame === 'user_defensive' || input.recovery === 'defensive_spiral'
        ? 'falling'
        : 'stable'

  const respectSignal =
    perception === 'strengthening'
      ? 'rising'
      : perception === 'weakening' || perception === 'at_risk'
        ? 'falling'
        : 'stable'

  return {
    perception,
    score,
    trustMovement,
    credibilityMovement,
    respectSignal,
    reason: reasons.length ? reasons.join(', ') : 'User perception appears stable.',
  }
}
