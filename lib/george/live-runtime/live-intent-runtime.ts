export type LiveIntentStage =
  | 'confirm_intent'
  | 'confirm_relation'
  | 'collect_signal'
  | 'confirm_preview'

export type LiveIntentSourceContext = {
  summary?: string | null
} | null

export type LiveIntentSignals = {
  role: string
  counterparty: string
  desiredOutcome: string
  sourceContext: string
}

export const LIVE_PREPARATION_SIGNAL_KEYS = [
  'name',
  'role',
  'counterparty',
  'desiredOutcome',
  'acceptableOutcome',
] as const

export type LivePreparationSignalKey =
  (typeof LIVE_PREPARATION_SIGNAL_KEYS)[number]

export function resolveFirstMissingLivePreparationSignal(
  signals: Record<string, unknown> | null | undefined
): LivePreparationSignalKey | null {
  const source = signals || {}

  for (const key of LIVE_PREPARATION_SIGNAL_KEYS) {
    if (!String(source[key] || '').trim()) return key
  }

  return null
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
      Boolean(String(source.role || '').trim()) &&
      Boolean(String(source.counterparty || '').trim()) &&
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
        'I can prepare you for this conversation.\n\nQuick LIVE: Begin with what I already know. I’ll ask only for what is still missing.\n\nFull Brief: Keep preparing with me before we enter LIVE.',
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
      assistantContent: 'No problem. We’ll stay here.',
      clearStage: true,
      clearSourceContext: true,
      clearPromptContext: true,
    }
  }

  if (stage === 'confirm_intent') {
    return {
      nextStage: 'confirm_relation',
      assistantContent: yesIntent
        ? 'Good. Is LIVE for this session, or a different room you’re walking into?'
        : 'I can do that. Is LIVE for this session, or a different room you’re walking into?',
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
          role: '',
          counterparty: '',
          desiredOutcome: direction,
          sourceContext: String(sourceContext.summary || '').slice(0, 700),
        },
        assistantContent: '',
      }
    }

    return {
      nextStage: 'collect_signal',
      assistantContent: 'Tell me the room and the outcome. For example: “interview with hiring manager — get the offer.”',
    }
  }

  if (stage === 'collect_signal') {
    return {
      nextStage: 'confirm_preview',
      preLiveSignals: {
        role: '',
        counterparty: '',
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
    assistantContent: 'I can prepare LIVE. Is that what you want to do?',
  }
}
