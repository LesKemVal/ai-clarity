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
  shouldSurfaceEarbud: boolean
  shouldExplainLive: boolean
  strength: LiveRecommendationStrength
  executionImminent: boolean
  conversationPressure: boolean
  trajectorySignal: boolean
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

  const trajectorySignal =
    Boolean(input.objectiveKnown) &&
    hasAny(t, [
      /\bfounder\b/,
      /\bstartup\b/,
      /\bbusiness\b/,
      /\bcompany\b/,
      /\bproduct\b/,
      /\bcapital\b/,
      /\bfunding\b/,
      /\binvestor\b/,
      /\bpartner(ship)?\b/,
      /\bcustomer(s)?\b/,
      /\bhiring\b/,
      /\bjob\b/,
      /\binterview\b/,
      /\bnegotiate\b/,
      /\bdeal\b/,
      /\bpitch\b/,
      /\bpresentation\b/,
    ])

  const signalUsable =
    input.signalSufficiency === 'sufficient' ||
    input.signalSufficiency === 'needs-smallest-signal'

  const shouldRecommendLive =
    !alreadyLive &&
    signalUsable &&
    executionImminent &&
    conversationPressure

  const shouldSurfaceEarbud =
    !alreadyLive &&
    signalUsable &&
    (trajectorySignal || conversationPressure)

  const shouldExplainLive =
    shouldSurfaceEarbud &&
    !shouldRecommendLive

  const strength: LiveRecommendationStrength =
    !shouldRecommendLive ? 'none' :
    input.signalSufficiency === 'sufficient' && Boolean(input.pressureHigh) ? 'strong' :
    input.signalSufficiency === 'sufficient' ? 'recommend' :
    'soft'

  const reason =
    shouldRecommendLive
      ? 'The situation appears to be moving from planning into real-time human execution pressure.'
      : shouldExplainLive
        ? 'GEORGE has enough trajectory signal to understand that LIVE may become useful down the road.'
        : alreadyLive
          ? 'Already in LIVE mode.'
          : !signalUsable
            ? 'Signal is not sufficient enough to explain LIVE usefully yet.'
            : !trajectorySignal && !conversationPressure
              ? 'Trajectory does not yet indicate a realistic future live benefit.'
              : 'LIVE recommendation threshold not met.'

  const instruction =
    shouldRecommendLive
      ? strength === 'strong'
        ? 'LIVE RECOMMENDATION GOVERNOR: The user appears to be entering real-time execution pressure. Offer LIVE as available support without selling it. Ask simply if they want GEORGE in the room.'
        : 'LIVE RECOMMENDATION GOVERNOR: Offer LIVE as optional execution support only if the user is about to enter the room. Do not upsell and do not auto-route.'
      : shouldExplainLive
        ? 'LIVE RECOMMENDATION GOVERNOR: Earbud may be surfaced as a quiet capability marker. Explain LIVE only once when the user taps or asks. Frame it as potentially useful down the road, not as the next required move.'
        : 'LIVE RECOMMENDATION GOVERNOR: Do not recommend LIVE. Continue normal GEORGE support.'

  return {
    shouldRecommendLive,
    shouldSurfaceEarbud,
    shouldExplainLive,
    strength,
    executionImminent,
    conversationPressure,
    trajectorySignal,
    reason,
    instruction,
  }
}

export function buildLiveRecommendationNote(state: LiveRecommendationState) {
  return `
LIVE RECOMMENDATION GOVERNOR
- Recommend LIVE: ${state.shouldRecommendLive ? 'yes' : 'no'}
- Surface earbud: ${state.shouldSurfaceEarbud ? 'yes' : 'no'}
- Explain LIVE: ${state.shouldExplainLive ? 'yes' : 'no'}
- Strength: ${state.strength}
- Execution imminent: ${state.executionImminent ? 'yes' : 'no'}
- Conversation pressure: ${state.conversationPressure ? 'yes' : 'no'}
- Trajectory signal: ${state.trajectorySignal ? 'yes' : 'no'}
- Reason: ${state.reason}
- Rule: The earbud appearing does not mean LIVE is next.
- Rule: The earbud appearing means GEORGE has enough signal to understand that LIVE might be useful down the road.
- Rule: Do not explain LIVE when GEORGE only understands the topic. Explain LIVE when GEORGE understands the user's trajectory.
- Rule: The user retains agency. GEORGE may surface or explain LIVE, but must not push or auto-route the user into LIVE.
- ${state.instruction}
`.trim()
}
