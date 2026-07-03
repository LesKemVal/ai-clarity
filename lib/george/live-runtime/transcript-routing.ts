export type LiveSteeringAction =
  | 'buy_time'
  | 'repeat_last_line'
  | 'compress_last_line'
  | 'say_it_this_way'
  | 'bring_it_back'
  | 'hold_the_line'
  | 'close_with'
  | 'awareness_check'

export type LiveSteeringPhraseMap = Partial<Record<LiveSteeringAction, string[]>>

export const DEFAULT_LIVE_STEERING_PHRASES: LiveSteeringPhraseMap = {
  buy_time: [
    'one second',
    'hold on',
    'give me a second',
    'give me a moment',
    'let me think',
  ],
  repeat_last_line: [
    'line',
    'give me the line',
    'say that again',
    'repeat that',
    'repeat it',
  ],
  compress_last_line: [
    'shorter',
    'make it shorter',
    'tighten it',
    'keep it tight',
    "let's keep this tight",
    'lets keep this tight',
  ],
  say_it_this_way: [
    'say it this way',
    'say this',
  ],
  bring_it_back: [
    'bring it back',
  ],
  hold_the_line: [
    'hold the line',
  ],
  close_with: [
    'close with',
  ],
  awareness_check: [
    'anything',
    'anything important',
    'anything i am missing',
    "anything i'm missing",
    'what am i missing',
  ],
}

function normalizeLiveSteeringText(text: string) {
  return String(text || '').trim().toLowerCase()
}

function matchesLiveSteeringPhrase(text: string, phrases: string[] = []) {
  const normalized = normalizeLiveSteeringText(text)

  return phrases.some((phrase) => normalized === phrase || normalized.startsWith(`${phrase} `))
}

function getDefaultSteeringPhrases(action: LiveSteeringAction) {
  return DEFAULT_LIVE_STEERING_PHRASES[action] || []
}

function getSteeringPhrases(
  action: LiveSteeringAction,
  custom?: LiveSteeringPhraseMap
) {
  return [
    ...getDefaultSteeringPhrases(action),
    ...(custom?.[action] || []),
  ].filter(Boolean)
}

const STANDALONE_FILLER_TOKENS = new Set([
  'yeah',
  'okay',
  'ok',
  'right',
  'mm',
  'uh',
  'um',
])

function isCompressLineSteeringPhrase(text: string, custom?: LiveSteeringPhraseMap) {
  return matchesLiveSteeringPhrase(text, getSteeringPhrases('compress_last_line', custom))
}

function isRepeatLineSteeringPhrase(text: string, custom?: LiveSteeringPhraseMap) {
  return matchesLiveSteeringPhrase(text, getSteeringPhrases('repeat_last_line', custom))
}

function isAwarenessCheckSteeringPhrase(text: string, custom?: LiveSteeringPhraseMap) {
  return matchesLiveSteeringPhrase(text, getSteeringPhrases('awareness_check', custom))
}

export function getBuyTimeDurationMs(text: string) {
  const normalized = normalizeLiveSteeringText(text)

  if (matchesLiveSteeringPhrase(normalized, ['one second'])) return 2500
  if (matchesLiveSteeringPhrase(normalized, ['hold on'])) return 4000
  if (matchesLiveSteeringPhrase(normalized, ['give me a second'])) return 3500
  if (matchesLiveSteeringPhrase(normalized, ['give me a moment'])) return 6000
  if (matchesLiveSteeringPhrase(normalized, ['let me think'])) return 5000

  return 0
}

function isBuyTimeSteeringPhrase(text: string, custom?: LiveSteeringPhraseMap) {
  return getBuyTimeDurationMs(text) > 0 || matchesLiveSteeringPhrase(text, getSteeringPhrases('buy_time', custom))
}

export function isLiveSteeringPhrase(text: string) {
  const normalized = normalizeLiveSteeringText(text)
  if (!normalized) return false

  return Object.values(DEFAULT_LIVE_STEERING_PHRASES)
    .flat()
    .some((phrase) => normalized.includes(phrase))
}

export function isStandaloneFillerTranscript(text: string) {
  const normalized = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:"'’“”()[\]{}]/g, '')

  return STANDALONE_FILLER_TOKENS.has(normalized)
}

export type LiveTranscriptDecision =
  | {
      type: 'ignore'
      reason: string
    }
  | {
      type: 'local'
      content:
        | 'buy_time'
        | 'repeat_last_line'
        | 'compress_last_line'
        | 'awareness_check'
    }
  | {
      type: 'send'
      text: string
    }

export type LastLiveFinalTranscript = {
  text: string
  at: number
  pending?: boolean
} | null

export type LiveTranscriptRoutingContext = {
  isThinking?: boolean
  isSpeaking?: boolean
  liveMode?: boolean
  buyTimeUntil?: number
  steeringPhrases?: LiveSteeringPhraseMap
}

function isLikelyIncompleteLiveThought(text: string) {
  const clean = String(text || '').trim()
  if (!clean) return false
  if (/[.!?][”"]?$/.test(clean)) return false

  const lower = clean.toLowerCase()

  if (/\b(and|but|because|so|which|that|what|why|how|when|where|who|must|should|can|could|would|will|to|for|about|with|the|a|an|most|single|point)$/i.test(lower)) {
    return true
  }

  if (/\b(what is the|what's the|based on|given everything|in the first|i need to|i must|i should)$/i.test(lower)) {
    return true
  }

  return clean.split(/\s+/).length >= 8 && !/[.!?]/.test(clean)
}

function mergePendingLiveTranscript(last: LastLiveFinalTranscript, text: string) {
  if (!last?.pending) return text
  const previous = String(last.text || '').trim()
  const next = String(text || '').trim()
  if (!previous) return next
  if (!next) return previous
  return `${previous} ${next}`.replace(/\s+/g, ' ').trim()
}

export function routeLiveTranscript(params: {
  text: string
  lastFinalTranscript: LastLiveFinalTranscript
  context?: LiveTranscriptRoutingContext
  now?: number
}): {
  decision: LiveTranscriptDecision
  nextFinalTranscript: LastLiveFinalTranscript
} {
  const rawText = String(params.text || '').trim()
  const now = params.now ?? Date.now()
  const last = params.lastFinalTranscript
  const text = mergePendingLiveTranscript(last, rawText)

  if (!text) {
    return {
      decision: {
        type: 'ignore',
        reason: 'empty_final_transcript',
      },
      nextFinalTranscript: last,
    }
  }

  if (params.context?.isSpeaking) {
    return {
      decision: {
        type: 'ignore',
        reason: 'george_is_speaking',
      },
      nextFinalTranscript: last,
    }
  }

  if (params.context?.buyTimeUntil && now < params.context.buyTimeUntil) {
    return {
      decision: {
        type: 'ignore',
        reason: 'buy_time_window_active',
      },
      nextFinalTranscript: last,
    }
  }

  if (params.context?.isThinking) {
    return {
      decision: {
        type: 'ignore',
        reason: 'george_is_thinking',
      },
      nextFinalTranscript: last,
    }
  }

  const steeringPhrases = params.context?.steeringPhrases

  if (isBuyTimeSteeringPhrase(text, steeringPhrases)) {
    return {
      decision: {
        type: 'local',
        content: 'buy_time',
      },
      nextFinalTranscript: last,
    }
  }

  if (isRepeatLineSteeringPhrase(text, steeringPhrases)) {
    return {
      decision: {
        type: 'local',
        content: 'repeat_last_line',
      },
      nextFinalTranscript: last,
    }
  }

  if (isCompressLineSteeringPhrase(text, steeringPhrases)) {
    return {
      decision: {
        type: 'local',
        content: 'compress_last_line',
      },
      nextFinalTranscript: last,
    }
  }

  if (isAwarenessCheckSteeringPhrase(text, steeringPhrases)) {
    return {
      decision: {
        type: 'local',
        content: 'awareness_check',
      },
      nextFinalTranscript: last,
    }
  }

  if (last && !last.pending && last.text === text && now - last.at < 1800) {
    return {
      decision: {
        type: 'ignore',
        reason: 'duplicate_final_transcript',
      },
      nextFinalTranscript: last,
    }
  }

  if (isLikelyIncompleteLiveThought(text)) {
    return {
      decision: {
        type: 'ignore',
        reason: 'likely_incomplete_live_thought',
      },
      nextFinalTranscript: { text, at: now, pending: true },
    }
  }

  const nextFinalTranscript = { text, at: now }

  return {
    decision: {
      type: 'send',
      text,
    },
    nextFinalTranscript,
  }
}
