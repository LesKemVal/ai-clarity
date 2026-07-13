export type DecisionSurface =
  | 'answer'
  | 'clarify'
  | 'defend'
  | 'redirect'
  | 'negotiate'
  | 'decide'
  | 'deescalate'
  | 'execute'
  | 'hold'

export type SignalSufficiency = 'sufficient' | 'needs-smallest-signal' | 'insufficient'

export type JudgmentSurfaceInput = {
  latestUserText: string
  livePressure?: boolean
  pressureHigh?: boolean
  objectiveKnown?: boolean
}

export type JudgmentSurfaceState = {
  decisionSurface: DecisionSurface
  signalSufficiency: SignalSufficiency
  shouldAcquireSignal: boolean
  smallestSignal?: string
  instruction: string
}

function hasAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text))
}

export function buildJudgmentSurfaceState(input: JudgmentSurfaceInput): JudgmentSurfaceState {
  const t = input.latestUserText.toLowerCase().trim()
  const pressureHigh = Boolean(input.pressureHigh || input.livePressure)
  const objectiveKnown = input.objectiveKnown ?? true

  const asksWhatToSay = hasAny(t, [/what (do|should) i say/, /how (do|should) i respond/, /give me (a )?line/, /say this/])
  const challenged = hasAny(t, [/challenged/, /push(ed)? back/, /object(ed|ion)/, /questioned my/, /disagree/, /called out/])
  const negotiate = hasAny(t, [/negotiate/, /terms/, /concession/, /price/, /offer/, /counter/])
  const conflict = hasAny(t, [/argument/, /fight/, /upset/, /angry/, /heated/, /tension/])
  const blocked = hasAny(t, [/stuck/, /blocked/, /can't move/, /cannot move/, /not working/])
  const asksDecision = hasAny(t, [/what should i do/, /which (one|way|path)/, /should i /, /do i /])
  const asksClarification = hasAny(t, [/what does .* mean/, /explain/, /clarify/, /help me understand/])

  const decisionSurface: DecisionSurface =
    asksWhatToSay && challenged ? 'defend' :
    asksWhatToSay ? 'answer' :
    negotiate ? 'negotiate' :
    conflict ? 'deescalate' :
    challenged ? 'defend' :
    asksClarification ? 'clarify' :
    asksDecision ? 'decide' :
    blocked ? 'execute' :
    pressureHigh ? 'execute' :
    'decide'

  const hasSpecificContext = t.split(/\s+/).length >= 8
  const hasLiveSituation = hasAny(t, [/meeting/, /call/, /interview/, /room/, /they just/, /he just/, /she just/, /right now/])
  const hasOutcomeLanguage = hasAny(t, [/need to/, /trying to/, /want to/, /goal/, /outcome/, /close/, /win/, /protect/, /keep/])
  const isPreparationRequest = hasAny(t, [
    /\bprepare\b/,
    /\bpreparing\b/,
    /\bplan(?:ning)?\b/,
    /\bget ready\b/,
    /\bhelp me write\b/,
    /\bteach me\b/,
  ])

  const sufficientForJudgment =
    asksWhatToSay ||
    (pressureHigh && (hasSpecificContext || hasLiveSituation)) ||
    (decisionSurface !== 'decide' && hasSpecificContext)

  const signalSufficiency: SignalSufficiency =
    sufficientForJudgment ? 'sufficient' :
    objectiveKnown || hasOutcomeLanguage ? 'needs-smallest-signal' :
    'insufficient'

  const smallestSignal =
    signalSufficiency === 'sufficient' ? undefined :
    !objectiveKnown && !hasOutcomeLanguage ? 'the desired outcome' :
    isPreparationRequest ? 'the specific outcome this preparation needs to achieve' :
    decisionSurface === 'negotiate' ? 'the line you cannot cross' :
    decisionSurface === 'defend' ? 'what they are challenging: fact, method, motive, or consequence' :
    decisionSurface === 'deescalate' ? 'whether the objective is repair, boundary, or exit' :
    'the one fact that would change the next move'

  const shouldAcquireSignal = signalSufficiency !== 'sufficient'

  const instruction = shouldAcquireSignal
    ? `JUDGMENT SURFACE: The likely decision is ${decisionSurface}. Acquire only the smallest useful signal: ${smallestSignal}. Do not ask broad intake questions.`
    : `JUDGMENT SURFACE: The likely decision is ${decisionSurface}. Treat the signal as sufficient for a useful next move. Act first; ask for more only if it would materially change the decision.`

  return {
    decisionSurface,
    signalSufficiency,
    shouldAcquireSignal,
    smallestSignal,
    instruction,
  }
}

export function buildJudgmentSurfaceNote(state: JudgmentSurfaceState) {
  return `
JUDGMENT SURFACE
- Decision surface: ${state.decisionSurface}
- Signal sufficiency: ${state.signalSufficiency}
- Acquire signal first: ${state.shouldAcquireSignal ? 'yes' : 'no'}
${state.smallestSignal ? `- Smallest useful signal: ${state.smallestSignal}` : '- Smallest useful signal: not needed before first useful move'}
- Rule: GEORGE seeks the decision before seeking more information.
- Rule: Signals exist to improve decisions, not satisfy curiosity.
- ${state.instruction}
`.trim()
}
