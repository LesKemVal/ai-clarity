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

export type LiveIntentRuntimeResult = {
  assistantContent: string
  nextStage?: LiveIntentStage | null
  clearStage?: boolean
  clearSourceContext?: boolean
  preLiveSignals?: LiveIntentSignals | null
  navigateToLiveEntry?: boolean
  clearPromptContext?: boolean
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
            ? 'Prepare the room and answer clearly'
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
        assistantContent: `I think I have enough.\n\nSession: current GEORGE session\nDirection: ${direction}\n\nSay “confirm” and I’ll prepare the room.`,
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
      assistantContent: `I think I have enough.\n\nDirection: ${text}\n\nSay “confirm” and I’ll prepare the room.`,
    }
  }

  if (stage === 'confirm_preview') {
    if (/\b(confirm|yes|yeah|yep|continue|go|start|preview)\b/.test(lower)) {
      return {
        assistantContent: '',
        clearStage: true,
        navigateToLiveEntry: true,
      }
    }

    return {
      assistantContent: 'Say “confirm” when you want me to prepare the room.',
    }
  }

  return {
    nextStage: 'confirm_intent',
    assistantContent: 'I can prepare LIVE. Is that what you want to do?',
  }
}
