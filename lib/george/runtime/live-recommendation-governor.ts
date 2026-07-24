import type { SignalSufficiency } from './judgment-surface'

export type LiveRecommendationEvidenceInput = {
  latestUserText: string
  signalSufficiency: SignalSufficiency
  currentRuntime?: string
  pressureHigh?: boolean
  objectiveKnown?: boolean
}

export type LiveRecommendationEvidence = {
  alreadyLive: boolean
  signalUsable: boolean
  executionImminent: boolean
  conversationPressure: boolean
  trajectorySignal: boolean
  hasConversationOutcome: boolean
  pressureHigh: boolean
  directGeorgeParticipationRequest: boolean
}

function hasAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text))
}

export function evaluateLiveRecommendationEvidence(
  input: LiveRecommendationEvidenceInput
): LiveRecommendationEvidence {
  const t = String(input.latestUserText || '').toLowerCase().trim()
  const alreadyLive = input.currentRuntime === 'live_george'
  const directGeorgeParticipationRequest = hasAny(t, [
    /\b(?:let'?s|lets) get on (?:a|the) call together\b/,
    /\b(?:join|come on|be on) (?:a|the|my|our) call(?: with me| with us)?\b/,
    /\b(?:talk|speak) (?:to|with) me on (?:a|the) call\b/,
    /\bcan you (?:join|come on|be on) (?:a|the|my|our) call\b/,
  ])

  const executionImminent =
    !directGeorgeParticipationRequest &&
    hasAny(t, [
      /\bright now\b/,
      /\bin \d+\s?(minutes?|mins?|hours?)\b/,
      /\b(?:meeting|call|interview|presentation|negotiation|session)\s+(?:starts?|begins?|kicks? off)\s+in\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:minutes?|mins?|hours?)\b/,
      /\b(?:meeting|call|interview|presentation|negotiation|session)\s+is\s+in\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:minutes?|mins?|hours?)\b/,
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
    !directGeorgeParticipationRequest &&
    (Boolean(input.pressureHigh) ||
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
      ]))

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

  const hasConversationOutcome =
    Boolean(input.objectiveKnown) && conversationPressure

  return {
    alreadyLive,
    signalUsable,
    executionImminent,
    conversationPressure,
    trajectorySignal,
    hasConversationOutcome,
    pressureHigh: Boolean(input.pressureHigh),
    directGeorgeParticipationRequest,
  }
}
