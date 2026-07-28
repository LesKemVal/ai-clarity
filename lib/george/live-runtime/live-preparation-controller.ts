import {
  LIVE_PREPARATION_QUESTIONS,
  resolveLivePreparationReadiness,
  resolveLivePreparationTransition,
  type LivePreparationSignalKey,
} from './live-intent-runtime'

export type LivePreparationSignals = Record<string, string>

export type LivePreparationRoute =
  | 'normal'
  | 'live_entry'
  | 'homepage'

export type LivePreparationRouteContext = {
  route: LivePreparationRoute
  conversationTypeId?: string | null
  conversationType?: string | null
  conversationGroup?: string | null
}

export function normalizeLivePreparationSignals(
  signals: Record<string, unknown> | null | undefined,
): LivePreparationSignals {
  const normalized: LivePreparationSignals = {}

  for (const [key, value] of Object.entries(signals || {})) {
    const cleanValue = String(value ?? '').trim()

    if (cleanValue) {
      normalized[key] = cleanValue
    }
  }

  return normalized
}

export function mergeLivePreparationSignal(input: {
  signals: Record<string, unknown> | null | undefined
  key: LivePreparationSignalKey | string
  value: unknown
}): LivePreparationSignals {
  return normalizeLivePreparationSignals({
    ...(input.signals || {}),
    [input.key]: input.value,
  })
}

export function resolveLivePreparationState(
  signals: Record<string, unknown> | null | undefined,
) {
  const normalizedSignals = normalizeLivePreparationSignals(signals)
  const transition = resolveLivePreparationTransition(normalizedSignals)
  const readiness = resolveLivePreparationReadiness(normalizedSignals)
  const activeQuestion = transition.question

  return Object.freeze({
    signals: normalizedSignals,
    transition,
    readiness,
    activeQuestion,
    activeQuestionIndex: activeQuestion
      ? LIVE_PREPARATION_QUESTIONS.findIndex(
          (question) => question.key === activeQuestion.key,
        )
      : LIVE_PREPARATION_QUESTIONS.length,
    canEnterFinalCheck: readiness.thresholdMet,
  })
}

export function buildLivePreparationRouteHandoff(input: {
  context: LivePreparationRouteContext
  signals: Record<string, unknown> | null | undefined
  createdAt?: number
}) {
  const preparationState = resolveLivePreparationState(input.signals)

  return Object.freeze({
    sourceRoute: input.context.route,
    conversationTypeId: input.context.conversationTypeId || null,
    conversationType: input.context.conversationType || null,
    conversationGroup: input.context.conversationGroup || null,
    signals: preparationState.signals,
    readiness: preparationState.readiness,
    createdAt: input.createdAt ?? Date.now(),
  })
}
