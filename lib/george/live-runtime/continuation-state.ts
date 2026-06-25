export type ContinuationState =
  | 'complete'
  | 'unfinished'
  | 'handoff'
  | 'pause'
  | 'outcome_shift'

export type ContinuationAssessment = {
  state: ContinuationState
  confidence: number
  likelyMissing: string[]
  preservedObjective: boolean
  interrupted: boolean
  reason: string
}

const EXPLICIT_HANDOFF =
  /\b(george[,\s]+take it|take it george|take this|you answer|answer for me|carry this|finish this|complete that|help me finish)\b/i

const EXPLICIT_CONTINUATION_TRIGGER = /(?:\.{3}|…)+$/
const CLOSED_PUNCTUATION = /[.!?]$/

const COMPLETE_SHORT_STATEMENTS = [
  /^i agree$/i,
  /^that's right$/i,
  /^thats right$/i,
  /^makes sense$/i,
  /^correct$/i,
  /^yes$/i,
  /^yeah$/i,
  /^no$/i,
  /^okay$/i,
  /^ok$/i,
]

const UNFINISHED_THOUGHT_SIGNALS = [
  /\b(the thing|what matters|the point|the issue|the question|the reason|the concern)\b/i,
  /\b(comes down to|depends on|starts with|means that|shows that|is whether|is that)\b/i,
  /\b(i think|i believe|what i mean|what i'm saying|what im saying)\b/i,
  /\b(if|when|because|whether|regarding|about)\b/i,
]

function normalize(value: unknown) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function wordCount(value: string) {
  return normalize(value).split(' ').filter(Boolean).length
}

export function assessContinuationState(input: {
  transcript: string
  recentContext?: string | null
  supportStyle?: string | null
  speakerIntent?: string | null
}): ContinuationAssessment {
  const transcript = normalize(input.transcript)
  const recentContext = normalize(input.recentContext)
  const combined = `${recentContext} ${transcript}`.trim()
  const supportStyle = normalize(input.supportStyle).toLowerCase()
  const speakerIntent = normalize(input.speakerIntent).toLowerCase()

  if (!transcript) {
    return {
      state: 'pause',
      confidence: 0,
      likelyMissing: [],
      preservedObjective: Boolean(recentContext),
      interrupted: false,
      reason: 'No transcript content.',
    }
  }

  if (EXPLICIT_HANDOFF.test(combined)) {
    return {
      state: 'handoff',
      confidence: 0.94,
      likelyMissing: ['next conversational turn'],
      preservedObjective: Boolean(recentContext),
      interrupted: false,
      reason: 'User explicitly handed continuation to GEORGE.',
    }
  }

  if (EXPLICIT_CONTINUATION_TRIGGER.test(transcript)) {
    return {
      state: 'unfinished',
      confidence: 0.92,
      likelyMissing: ['completion of unfinished thought'],
      preservedObjective: Boolean(recentContext),
      interrupted: false,
      reason: 'Explicit continuation trigger detected.',
    }
  }

  const transcriptWithoutTrigger = normalize(transcript.replace(EXPLICIT_CONTINUATION_TRIGGER, ''))
  if (CLOSED_PUNCTUATION.test(transcriptWithoutTrigger || transcript)) {
    return {
      state: 'complete',
      confidence: 0.9,
      likelyMissing: [],
      preservedObjective: Boolean(recentContext),
      interrupted: false,
      reason: 'Transcript closes with punctuation.',
    }
  }

  if (COMPLETE_SHORT_STATEMENTS.some((pattern) => pattern.test(transcript))) {
    return {
      state: 'complete',
      confidence: 0.86,
      likelyMissing: [],
      preservedObjective: Boolean(recentContext),
      interrupted: false,
      reason: 'Transcript is a short complete statement.',
    }
  }

  const shortFragment = wordCount(transcript) <= 7
  const unfinishedSignal = UNFINISHED_THOUGHT_SIGNALS.some((pattern) => pattern.test(transcript))
  const continuationMode = supportStyle === 'continue' || supportStyle === 'continuation'
  const assistedIntent = speakerIntent === 'assisted_continuation'

  if (unfinishedSignal || assistedIntent || (continuationMode && shortFragment)) {
    return {
      state: 'unfinished',
      confidence: unfinishedSignal ? 0.82 : 0.68,
      likelyMissing: ['meaningful completion'],
      preservedObjective: Boolean(recentContext),
      interrupted: shortFragment && Boolean(recentContext),
      reason: unfinishedSignal
        ? 'Transcript carries an unfinished thought signal.'
        : 'Short fragment in continuation mode likely needs completion.',
    }
  }

  return {
    state: 'complete',
    confidence: 0.42,
    likelyMissing: [],
    preservedObjective: Boolean(recentContext),
    interrupted: false,
    reason: 'No continuation state rose above threshold.',
  }
}
