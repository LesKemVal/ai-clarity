import type { SignalSufficiency } from './judgment-surface'

export type LiveRecommendationStrength =
  | 'none'
  | 'soft'
  | 'recommend'
  | 'strong'

export type LiveRecommendationInput = {
  latestUserText: string
  signalSufficiency: SignalSufficiency
  currentRuntime?: string
  pressureHigh?: boolean
  objectiveKnown?: boolean
}

export type LiveRecommendationState = {
  shouldRecommendLive: boolean
  strength: LiveRecommendationStrength
  executionImminent: boolean
  conversationPressure: boolean
  reason: string
  instruction: string
}

function hasAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text))
}

export function evaluateLiveRecommendation(
  input: LiveRecommendationInput
): LiveRecommendationState {
  const t = String(input.latestUserText || '').toLowerCase().trim()
  const alreadyLive = input.currentRuntime === 'live_george'

  const executionImminent =
    hasAny(t, [
      /\bright now\b/,
      /\bin \d+\s?(minutes?|mins?|hours?)\b/,
      /\babout to\b/,
      /\bwalking into\b/,
      /\bi'?m in\b/,
      /\bi am in\b/,
      /\bthey just\b/,
      /\bhe just\b/,
      /\bshe just\b/,
      /\bon the call\b/,
      /\bin the meeting\b/,
      /\bin an interview\b/,
      /\bpresenting\b/,
    ])

  const conversationPressure =
    Boolean(input.pressureHigh) ||
    hasAny(t, [
      /\bmeeting\b/,
      /\binterview\b/,
      /\bcall\b/,
      /\bnegotiation\b/,
      /\bpresentation\b/,
      /\bdebate\b/,
      /\bargument\b/,
      /\bclient\b/,
      /\bboss\b/,
      /\bmanager\b/,
      /\bboard\b/,
      /\binvestor\b/,
      /\bdoctor\b/,
      /\bchallenged\b/,
      /\bpush(ed)? back\b/,
      /\bpressure\b/,
      /\bwhat (do|should) i say\b/,
      /\bhow (do|should) i respond\b/,
    ])

  const signalUsable =
    input.signalSufficiency === 'sufficient' ||
    input.signalSufficiency === 'needs-smallest-signal'

  const shouldRecommendLive =
    !alreadyLive &&
    signalUsable &&
    executionImminent &&
    conversationPressure

  const strength: LiveRecommendationStrength =
    !shouldRecommendLive ? 'none' :
    input.signalSufficiency === 'sufficient' && Boolean(input.pressureHigh) ? 'strong' :
    input.signalSufficiency === 'sufficient' ? 'recommend' :
    'soft'

  const reason =
    shouldRecommendLive
      ? 'The situation appears to be moving from planning into real-time human execution pressure.'
      : alreadyLive
        ? 'Already in LIVE mode.'
        : !executionImminent
          ? 'Execution is not imminent.'
          : !conversationPressure
            ? 'Conversation pressure is not high enough for LIVE.'
            : !signalUsable
              ? 'Signal is not sufficient enough to recommend LIVE yet.'
              : 'LIVE recommendation threshold not met.'

  const instruction =
    shouldRecommendLive
      ? strength === 'strong'
        ? 'LIVE RECOMMENDATION GOVERNOR: Strongly offer LIVE as the next useful move. Do not sell it. Ask simply: "Would you like me in the room?"'
        : 'LIVE RECOMMENDATION GOVERNOR: Offer LIVE as optional execution support. Do not upsell. Frame it as the next useful move if the user is about to enter the room.'
      : 'LIVE RECOMMENDATION GOVERNOR: Do not recommend LIVE. Continue normal GEORGE support.'

  return {
    shouldRecommendLive,
    strength,
    executionImminent,
    conversationPressure,
    reason,
    instruction,
  }
}

export function buildLiveRecommendationNote(state: LiveRecommendationState) {
  return `
LIVE RECOMMENDATION GOVERNOR
- Recommend LIVE: ${state.shouldRecommendLive ? 'yes' : 'no'}
- Strength: ${state.strength}
- Execution imminent: ${state.executionImminent ? 'yes' : 'no'}
- Conversation pressure: ${state.conversationPressure ? 'yes' : 'no'}
- Reason: ${state.reason}
- Rule: Outcome Governor asks what advances the outcome.
- Rule: LIVE Recommendation Governor asks whether the outcome now requires real-time execution support.
- Rule: Runtime Decision decides what GEORGE should say or do next.
- Rule: The user retains agency. GEORGE may suggest LIVE, but must not push or auto-route the user into LIVE.
- ${state.instruction}
`.trim()
}
