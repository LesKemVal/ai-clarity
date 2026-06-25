import { assessContinuationState } from '../../live-runtime/continuation-state'

export type ContinuationCandidateInput = {
  transcript: string
  deliveryStyle?: string | null
  speakerIntent?: string | null
}

export type ContinuationCandidateResult = {
  candidate: boolean
  confidence: number
  explicitTrigger: boolean
  incompleteThought: boolean
  punctuationClosed: boolean
  reason: string
}

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

const TRAILING_CONTINUATION_PATTERNS = [
  /\b(is|are|was|were|because|that|which|when|where|if|whether|about|regarding)$/i,
  /\b(the reason|what matters|the biggest concern|the main concern|the issue|the point|the question)\s+(is|was)?$/i,
  /\b(comes down to|depends on|starts with|means that|shows that)$/i,
  /\b(i think|i believe|what i mean|what i'm saying|what im saying)\s+(is|that)?$/i,
]

function normalizeTranscript(transcript: string) {
  return transcript.trim().replace(/\s+/g, ' ')
}

function isContinuationStyle(deliveryStyle?: string | null) {
  return deliveryStyle === 'continue' || deliveryStyle === 'continuation'
}

export function evaluateContinuationCandidate(
  input: ContinuationCandidateInput
): ContinuationCandidateResult {
  const transcript = normalizeTranscript(input.transcript)

  if (!isContinuationStyle(input.deliveryStyle)) {
    return {
      candidate: false,
      confidence: 0,
      explicitTrigger: false,
      incompleteThought: false,
      punctuationClosed: false,
      reason: 'Continuation mode is not active.',
    }
  }

  if (!transcript) {
    return {
      candidate: false,
      confidence: 0,
      explicitTrigger: false,
      incompleteThought: false,
      punctuationClosed: false,
      reason: 'No transcript content.',
    }
  }

  const explicitTrigger = EXPLICIT_CONTINUATION_TRIGGER.test(transcript)
  const transcriptWithoutTrigger = normalizeTranscript(
    transcript.replace(EXPLICIT_CONTINUATION_TRIGGER, '')
  )
  const punctuationClosed = CLOSED_PUNCTUATION.test(transcriptWithoutTrigger || transcript)

  if (explicitTrigger) {
    return {
      candidate: true,
      confidence: 1,
      explicitTrigger: true,
      incompleteThought: true,
      punctuationClosed: false,
      reason: 'Explicit continuation trigger detected.',
    }
  }

  if (punctuationClosed) {
    return {
      candidate: false,
      confidence: 0.92,
      explicitTrigger: false,
      incompleteThought: false,
      punctuationClosed: true,
      reason: 'Transcript closes with punctuation.',
    }
  }

  if (COMPLETE_SHORT_STATEMENTS.some((pattern) => pattern.test(transcript))) {
    return {
      candidate: false,
      confidence: 0.86,
      explicitTrigger: false,
      incompleteThought: false,
      punctuationClosed: false,
      reason: 'Transcript is a short complete statement.',
    }
  }

  const wordCount = transcript.split(' ').filter(Boolean).length
  const hasTrailingContinuationPattern = TRAILING_CONTINUATION_PATTERNS.some((pattern) =>
    pattern.test(transcript)
  )

  const state = assessContinuationState({
    transcript,
    supportStyle: input.deliveryStyle,
    speakerIntent: input.speakerIntent,
  })

  if (state.state === 'handoff' || state.state === 'unfinished') {
    return {
      candidate: true,
      confidence: Math.max(state.confidence, hasTrailingContinuationPattern ? (wordCount <= 14 ? 0.88 : 0.76) : 0),
      explicitTrigger: false,
      incompleteThought: true,
      punctuationClosed: false,
      reason: state.reason,
    }
  }

  if (hasTrailingContinuationPattern) {
    return {
      candidate: true,
      confidence: wordCount <= 14 ? 0.88 : 0.76,
      explicitTrigger: false,
      incompleteThought: true,
      punctuationClosed: false,
      reason: 'Transcript appears to end on an incomplete thought.',
    }
  }

  return {
    candidate: false,
    confidence: state.confidence || 0.38,
    explicitTrigger: false,
    incompleteThought: false,
    punctuationClosed: false,
    reason: state.reason || 'No explicit continuation trigger or incomplete-thought signal detected.',
  }
}
