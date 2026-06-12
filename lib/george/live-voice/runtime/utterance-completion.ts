export type UtteranceCompletionAction = 'complete' | 'yield'

export type UtteranceCompletionReason =
  | 'user-paused-after-compatible-start'
  | 'user-still-speaking'
  | 'not-user-speech'
  | 'insufficient-start'
  | 'completed-sentence'

export type UtteranceCompletionInput = {
  speaker: 'user' | 'other_party' | 'george_instruction' | 'unclear'
  partialTranscript: string
  cue?: string
  activeObjective?: string
  roomSignal?: string
  knownFacts?: string[]
  msSinceUserSpeech?: number
  minTriggerWords?: number
  maxTriggerWords?: number
  pauseThresholdMs?: number
}

export type UtteranceCompletionDecision = {
  action: UtteranceCompletionAction
  shouldSurface: boolean
  reason: UtteranceCompletionReason
  wordCount: number
  completion: string
  factBoundary: 'safe-general' | 'fact-grounded' | 'not-needed'
}

const DEFAULT_MIN_TRIGGER_WORDS = 3
const DEFAULT_MAX_TRIGGER_WORDS = 5
const DEFAULT_PAUSE_THRESHOLD_MS = 650

const TERMINAL_PUNCTUATION = /[.!?]$/

const FACT_CLAIM_STARTERS = [
  /here'?s what (we|i)('?ve| have) done/i,
  /what (we|i)('?ve| have) done/i,
  /the proof is/i,
  /the numbers show/i,
  /our results show/i,
  /we solved/i,
  /we fixed/i,
]

const COMPATIBLE_STARTERS: Array<{ pattern: RegExp; completion: (input: UtteranceCompletionInput) => string }> = [
  {
    pattern: /\blet me be clear\b/i,
    completion: ({ activeObjective }) => activeObjective?.trim()
      ? `...the objective is ${activeObjective.trim()}.`
      : '...the objective is to leave here with a clear next step.',
  },
  {
    pattern: /\bi understand your concern\b/i,
    completion: () => '...and I want to address it directly.',
  },
  {
    pattern: /\bi just want to say\b/i,
    completion: ({ activeObjective }) => activeObjective?.trim()
      ? `...that I want to stay focused on ${activeObjective.trim()}.`
      : '...that I want to stay focused on the outcome.',
  },
  {
    pattern: /\bwhat i want to say\b/i,
    completion: ({ activeObjective }) => activeObjective?.trim()
      ? `...is that ${activeObjective.trim()} is the priority.`
      : '...is that the next step needs to be clear.',
  },
  {
    pattern: /\bi think we need\b/i,
    completion: () => '...to clarify the next step before we move forward.',
  },
  {
    pattern: /\bthe reason is\b/i,
    completion: () => '...we need to separate the concern from the decision in front of us.',
  },
  {
    pattern: /\bbased on what\b/i,
    completion: () => '...we know right now, I think the next step should be specific and measurable.',
  },
]

function clean(value: unknown) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function countWords(value: string) {
  const cleanValue = clean(value)
  if (!cleanValue) return 0
  return cleanValue.split(' ').filter(Boolean).length
}

function isFactClaimStarter(value: string) {
  return FACT_CLAIM_STARTERS.some((pattern) => pattern.test(value))
}

function hasKnownFacts(input: UtteranceCompletionInput) {
  return Array.isArray(input.knownFacts) && input.knownFacts.some((fact) => clean(fact).length > 0)
}

function getFactGroundedCompletion(input: UtteranceCompletionInput) {
  const firstFact = input.knownFacts?.map(clean).find(Boolean)
  if (!firstFact) return ''
  return `...and the clearest fact I can point to is this: ${firstFact}.`
}

function getCompatibleCompletion(input: UtteranceCompletionInput) {
  const partial = clean(input.partialTranscript)
  const direct = COMPATIBLE_STARTERS.find(({ pattern }) => pattern.test(partial))
  if (direct) return direct.completion(input)

  const cue = clean(input.cue).toLowerCase()

  if (/clar|clear|direct|deliberate/.test(cue)) {
    return input.activeObjective?.trim()
      ? `...the clearest point is that ${input.activeObjective.trim()} is the priority.`
      : '...the clearest point is that we need agreement on the next step.'
  }

  if (/acknowledge|concern|soften|diplomatic/.test(cue)) {
    return '...and I want to address that carefully.'
  }

  if (/next|advance|close|move/.test(cue)) {
    return '...so the useful move is to agree on the next step.'
  }

  return input.activeObjective?.trim()
    ? `...I want to keep this tied to ${input.activeObjective.trim()}.`
    : '...I want to keep this tied to the outcome.'
}

export function decideUtteranceCompletion(input: UtteranceCompletionInput): UtteranceCompletionDecision {
  const partial = clean(input.partialTranscript)
  const wordCount = countWords(partial)
  const minTriggerWords = input.minTriggerWords ?? DEFAULT_MIN_TRIGGER_WORDS
  const maxTriggerWords = input.maxTriggerWords ?? DEFAULT_MAX_TRIGGER_WORDS
  const pauseThresholdMs = input.pauseThresholdMs ?? DEFAULT_PAUSE_THRESHOLD_MS
  const msSinceUserSpeech = input.msSinceUserSpeech ?? 0

  if (input.speaker !== 'user') {
    return {
      action: 'yield',
      shouldSurface: false,
      reason: 'not-user-speech',
      wordCount,
      completion: '',
      factBoundary: 'not-needed',
    }
  }

  if (!partial || wordCount < minTriggerWords) {
    return {
      action: 'yield',
      shouldSurface: false,
      reason: 'insufficient-start',
      wordCount,
      completion: '',
      factBoundary: 'not-needed',
    }
  }

  if (TERMINAL_PUNCTUATION.test(partial)) {
    return {
      action: 'yield',
      shouldSurface: false,
      reason: 'completed-sentence',
      wordCount,
      completion: '',
      factBoundary: 'not-needed',
    }
  }

  if (msSinceUserSpeech < pauseThresholdMs) {
    return {
      action: 'yield',
      shouldSurface: false,
      reason: 'user-still-speaking',
      wordCount,
      completion: '',
      factBoundary: 'not-needed',
    }
  }

  const factClaim = isFactClaimStarter(partial)
  const factGrounded = factClaim && hasKnownFacts(input)
  const completion = factGrounded
    ? getFactGroundedCompletion(input)
    : factClaim
      ? '...and I want to answer that carefully.'
      : getCompatibleCompletion(input)

  return {
    action: 'complete',
    shouldSurface: wordCount <= Math.max(maxTriggerWords, wordCount),
    reason: 'user-paused-after-compatible-start',
    wordCount,
    completion,
    factBoundary: factGrounded ? 'fact-grounded' : factClaim ? 'safe-general' : 'not-needed',
  }
}

export const GEORGE_UTTERANCE_COMPLETION_DOCTRINE = {
  trigger: 'User begins a compatible thought and pauses after the learned word threshold.',
  defaultThreshold: `${DEFAULT_MIN_TRIGGER_WORDS}-${DEFAULT_MAX_TRIGGER_WORDS} words plus pause`,
  behavior: 'GEORGE surfaces a completion by default; the user may accept, modify, ignore, or replace it.',
  agency: 'The user owns the voice. GEORGE contributes language and continues tracking if ignored.',
  factSafety: 'GEORGE does not invent facts. If a completion requires missing facts, GEORGE uses a safe general completion.',
} as const
