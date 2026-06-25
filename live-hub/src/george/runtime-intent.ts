export type GeorgeRuntimeIntent =
  | 'TACTICAL_CUE'
  | 'CONTINUE_THOUGHT'
  | 'ANSWER_QUESTION'
  | 'PRESENTATION_CONTINUATION'
  | 'OBJECTION_RESPONSE'
  | 'CLARIFICATION_REQUEST'

export function classifyRuntimeIntent(input: {
  transcript: string
  deliveryStyle?: string
  category?: string
}): GeorgeRuntimeIntent {
  const text = input.transcript.trim().toLowerCase()

  if (input.deliveryStyle === 'continue') return 'CONTINUE_THOUGHT'
  if (input.deliveryStyle === 'expandedLine') return 'PRESENTATION_CONTINUATION'
  if (input.deliveryStyle === 'advice' || input.deliveryStyle === 'cue') return 'TACTICAL_CUE'

  if (
    text.includes("didn't catch") ||
    text.includes('repeat that') ||
    text.includes('say that again') ||
    text.includes('what do you mean')
  ) {
    return 'CLARIFICATION_REQUEST'
  }

  if (
    text.includes('too high') ||
    text.includes('believe') ||
    text.includes('concern') ||
    text.includes('objection') ||
    text.includes('risk') ||
    text.includes('why should') ||
    text.includes('why are') ||
    text.includes('why would')
  ) {
    return 'OBJECTION_RESPONSE'
  }

  if (
    text.endsWith('?') ||
    text.startsWith('why ') ||
    text.startsWith('what ') ||
    text.startsWith('how ') ||
    text.startsWith('who ') ||
    text.startsWith('when ') ||
    text.startsWith('where ') ||
    text.startsWith('can ') ||
    text.startsWith('should ')
  ) {
    return 'ANSWER_QUESTION'
  }

  return 'ANSWER_QUESTION'
}
