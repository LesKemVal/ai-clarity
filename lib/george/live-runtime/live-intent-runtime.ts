/*
 * ============================================================================
 * PRODUCTION NOTE — LIVE ENTRY ACQUISITION (DO NOT REMOVE)
 * ============================================================================
 *
 * GEORGE intentionally supports multiple routes into LIVE.
 *
 * These are NOT duplicate runtimes.
 *
 * Current entry surfaces include:
 *
 *   • Traditional LIVE preparation
 *   • Normal GEORGE surface → LIVE
 *   • Homepage → LIVE
 *
 * The objective is NOT to merge or eliminate these entry paths.
 *
 * The objective is ONLY to improve how preparation information is acquired.
 *
 * Planned acquisition flow:
 *
 *   1. Ask for the user's name.
 *   2. Ask:
 *        "Tell me everything I need to know about this conversation."
 *   3. Ask for the desired outcome.
 *   4. GEORGE extracts operational signals internally.
 *   5. Ask only the single highest-value follow-up question if needed.
 *   6. Allow LIVE once preparation is sufficient.
 *
 * This replaces rigid multi-question collection while preserving every
 * existing route into LIVE.
 *
 * Preparation doctrine changes information acquisition only.
 * It does NOT change LIVE architecture or entry surfaces.
 * ============================================================================
 */

export type LiveIntentStage =
  | 'confirm_intent'
  | 'confirm_relation'
  | 'collect_signal'
  | 'confirm_preview'

export type LiveIntentSourceContext = {
  summary?: string | null
} | null

export type LiveIntentSignals = {
  conversationContext: string
  desiredOutcome: string
  sourceContext: string
}

export const LIVE_PREPARATION_SIGNAL_KEYS = [
  'name',
  'conversationContext',
  'desiredOutcome',
] as const

export type LivePreparationSignalKey =
  (typeof LIVE_PREPARATION_SIGNAL_KEYS)[number]

export type LivePreparationQuestion = {
  key: LivePreparationSignalKey
  kicker: string
  label: string
  question: string
  examples: string
}


/*
 * ============================================================================
 * TODO — NEXT PRODUCTION ACQUISITION MODEL
 * ============================================================================
 *
 * Replace the fixed preparation interview with operational acquisition.
 *
 * Existing implementation:
 *
 *   Name
 *   Role
 *   Counterparty
 *   Desired Outcome
 *   Acceptable Outcome
 *
 * Planned implementation:
 *
 *   1. Name
 *   2. "Tell me everything I need to know about this conversation."
 *   3. Desired Outcome
 *   4. GEORGE extracts:
 *        - chair / role
 *        - counterparty
 *        - pressure
 *        - risks
 *        - leverage
 *        - constraints
 *        - history
 *        - operational signals
 *   5. Ask one additional question only if confidence requires it.
 *   6. LIVE becomes available.
 *
 * IMPORTANT:
 * Do NOT remove the three LIVE entry routes.
 * Change only information acquisition.
 * ============================================================================
 */

export const LIVE_PREPARATION_QUESTIONS: readonly LivePreparationQuestion[] =
  Object.freeze([
    {
      key: 'name',
      kicker: 'Identity',
      label: 'Question 1',
      question: 'What should I call you in this conversation?',
      examples: 'Examples: Lester, Mr. Sawyer, Coach, Dr. Patel.',
    },
    {
      key: 'conversationContext',
      kicker: 'Conversation',
      label: 'Question 2',
      question: 'Tell me everything I need to know about this conversation.',
      examples: 'Describe the people, situation, history, concerns, constraints, and anything that matters.',
    },
    {
      key: 'desiredOutcome',
      kicker: 'Outcome',
      label: 'Question 3',
      question: 'What outcome are you hoping to achieve?',
      examples: 'Describe the result you want GEORGE to help you move toward.',
    },
  ])

const LIVE_PREPARATION_QUESTION_BY_KEY =
  LIVE_PREPARATION_QUESTIONS.reduce(
    (questions, question) => {
      questions[question.key] = question.question
      return questions
    },
    {} as Record<LivePreparationSignalKey, string>
  )

export function resolveLivePreparationStep(step: number) {
  const normalizedStep = Number.isFinite(step)
    ? Math.max(0, Math.floor(step))
    : 0

  const question = LIVE_PREPARATION_QUESTIONS[normalizedStep] || null
  const complete = normalizedStep >= LIVE_PREPARATION_QUESTIONS.length

  return Object.freeze({
    step: normalizedStep,
    question,
    complete,
    total: LIVE_PREPARATION_QUESTIONS.length,
    nextStep: complete ? normalizedStep : normalizedStep + 1,
  })
}

export function resolveLivePreparationTransition(
  signals: Record<string, unknown> | null | undefined
) {
  const firstMissingKey =
    resolveFirstMissingLivePreparationSignal(signals)
  const total = LIVE_PREPARATION_QUESTIONS.length

  if (!firstMissingKey) {
    return Object.freeze({
      step: total,
      question: null,
      complete: true,
      total,
    })
  }

  const step = LIVE_PREPARATION_QUESTIONS.findIndex(
    (question) => question.key === firstMissingKey
  )

  if (step < 0) {
    throw new Error(
      `[GEORGE LIVE PREPARATION] Unknown preparation signal: ${firstMissingKey}`
    )
  }

  return Object.freeze({
    step,
    question: LIVE_PREPARATION_QUESTIONS[step],
    complete: false,
    total,
  })
}

export function resolveFirstMissingLivePreparationSignal(
  signals: Record<string, unknown> | null | undefined
): LivePreparationSignalKey | null {
  const source = signals || {}

  for (const key of LIVE_PREPARATION_SIGNAL_KEYS) {
    if (!String(source[key] || '').trim()) return key
  }

  return null
}

export function resolveLivePreparationQuestion(
  key: LivePreparationSignalKey
): string {
  return LIVE_PREPARATION_QUESTION_BY_KEY[key]
}

export function buildLivePreparationContinuation(input: {
  signals: Record<string, unknown> | null | undefined
  nextKey: LivePreparationSignalKey
}): string {
  const source = input.signals || {}
  const context = String(source.conversationContext || '').trim()
  const outcome = String(source.desiredOutcome || '').trim()
  const nextQuestion = resolveLivePreparationQuestion(input.nextKey)

  if (outcome) {
    return `We left off preparing around ${outcome}. ${nextQuestion}`
  }

  if (context) {
    return `We left off preparing for this conversation. ${nextQuestion}`
  }

  return `We left off here. ${nextQuestion}`
}

export function buildLivePreparationAcknowledgement(input: {
  completedKey: LivePreparationSignalKey
  nextKey: LivePreparationSignalKey
}): string {
  const nextQuestion = resolveLivePreparationQuestion(input.nextKey)

  switch (input.completedKey) {
    case 'name':
      return `Good. ${nextQuestion}`
    case 'conversationContext':
      return `That gives me the context I need. ${nextQuestion}`
    case 'desiredOutcome':
      return `That gives us something concrete to work toward. ${nextQuestion}`
    default:
      return nextQuestion
  }
}

export function resolveLivePreparationReadiness(
  signals: Record<string, unknown> | null | undefined
) {
  const source = signals || {}
  const requiredKeys = LIVE_PREPARATION_SIGNAL_KEYS
  const completedKeys = requiredKeys.filter((key) =>
    Boolean(String(source[key] || '').trim())
  )
  const percent = Math.round(
    (completedKeys.length / requiredKeys.length) * 100
  )

  return Object.freeze({
    completedKeys,
    missingKeys: requiredKeys.filter(
      (key) => !completedKeys.includes(key)
    ),
    percent,
    thresholdMet:
      Boolean(String(source.conversationContext || '').trim()) &&
      Boolean(String(source.desiredOutcome || '').trim()),
    complete: completedKeys.length === requiredKeys.length,
  })
}

export type LiveIntentRuntimeResult = {
  assistantContent: string
  nextStage?: LiveIntentStage | null
  clearStage?: boolean
  clearSourceContext?: boolean
  preLiveSignals?: LiveIntentSignals | null
  navigateToLiveEntry?: boolean
  clearPromptContext?: boolean
}

export type LiveMessageBarResolution =
  | {
      mode: 'choose_briefing'
      assistantContent: string
    }
  | {
      mode: 'start_full_brief'
    }
  | {
      mode: 'accept_current_session'
    }
  | {
      mode: 'correct_current_session'
      correction: string
      assistantContent: string
    }

export function resolveLiveMessageBarSetup(input: {
  text: string
}): Extract<
  LiveMessageBarResolution,
  {
    mode:
      | 'choose_briefing'
      | 'start_full_brief'
      | 'accept_current_session'
  }
> {
  const lower = String(input.text || '').trim().toLowerCase()
  const wantsFull = /\b(full|brief|deep|more|complete)\b/.test(lower)
  const wantsQuick = /\b(quick|fast|use this|yes|live)\b/.test(lower)

  if (!wantsFull && !wantsQuick) {
    return {
      mode: 'choose_briefing',
      assistantContent:
        'I can help you get ready for this conversation. We can begin with what I already know, or spend a little more time sharpening the briefing first.',
    }
  }

  if (wantsFull) {
    return {
      mode: 'start_full_brief',
    }
  }

  return {
    mode: 'accept_current_session',
  }
}

export function resolveLiveIntentRuntime(input: {
  text: string
  stage?: string | null
  sourceContext?: LiveIntentSourceContext
}): LiveIntentRuntimeResult {
  const text = input.text.trim()
  const lower = text.toLowerCase()
  const stage = (input.stage || 'confirm_intent') as LiveIntentStage
  const sourceContext = input.sourceContext || null

  const noIntent = /^(no|nah|not now|cancel|accident|wrong|mistake|nevermind|never mind)\b/.test(lower)
  const yesIntent = /^(yes|yeah|yep|correct|right|that|this|do it|continue|live)\b/.test(lower)

  if (noIntent) {
    return {
      assistantContent: 'No problem. We will stay here.',
      clearStage: true,
      clearSourceContext: true,
      clearPromptContext: true,
    }
  }

  if (stage === 'confirm_intent') {
    return {
      nextStage: 'confirm_relation',
      assistantContent: yesIntent
        ? 'Good. Are we preparing for the conversation we are already discussing, or a different room you are walking into?'
        : 'I can help you prepare. Is this for the conversation we are already discussing, or a different room you are walking into?',
    }
  }

  if (stage === 'confirm_relation') {
    const relatedToThis = /\b(this|same|here|yes|yeah|yep|related|current|conversation|session|thread)\b/.test(lower)

    if (relatedToThis && sourceContext?.summary) {
      const source = String(sourceContext.summary || '').toLowerCase()
      const direction =
        /reg cf|cf-spv|broker|dealer|portal|capital|investor|raise|funding/.test(source)
          ? 'Select structure and vendor path'
          : /interview|hiring|candidate/.test(source)
            ? 'Prepare the conversation and answer clearly'
            : /negotiation|terms|price|deal/.test(source)
              ? 'Protect position and move toward terms'
              : 'Carry this session into LIVE'

      return {
        nextStage: 'confirm_preview',
        preLiveSignals: {
          conversationContext: String(sourceContext.summary || '').slice(0, 700),
          desiredOutcome: direction,
          sourceContext: String(sourceContext.summary || '').slice(0, 700),
        },
        assistantContent: '',
      }
    }

    return {
      nextStage: 'collect_signal',
      assistantContent: 'Tell me a little about the conversation you are walking into and what you would like to achieve.',
    }
  }

  if (stage === 'collect_signal') {
    return {
      nextStage: 'confirm_preview',
      preLiveSignals: {
        conversationContext: sourceContext?.summary || '',
        desiredOutcome: text,
        sourceContext: sourceContext?.summary || '',
      },
      assistantContent: '',
    }
  }

  if (stage === 'confirm_preview') {
    return {
      assistantContent: '',
      clearStage: true,
      navigateToLiveEntry: true,
    }
  }

  return {
    nextStage: 'confirm_intent',
    assistantContent: 'I can help you prepare for LIVE. Is that what you want to do?',
  }
}
