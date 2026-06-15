const LIVE_STEERING_PHRASES = [
  'one second',
  'hold on',
  'give me a second',
  'give me a moment',
  'let me think',
  'say it this way',
  'say this',
  'shorter',
  'line',
  'bring it back',
  'hold the line',
  'close with',
]

const STANDALONE_FILLER_TOKENS = new Set([
  'yeah',
  'okay',
  'ok',
  'right',
  'mm',
  'uh',
  'um',
])

function isRepeatLineSteeringPhrase(text: string) {
  const normalized = String(text || '').trim().toLowerCase()

  return [
    'line',
    'give me the line',
    'say that again',
    'repeat that',
    'repeat it',
  ].some((phrase) => normalized === phrase || normalized.startsWith(`${phrase} `))
}

export function getBuyTimeDurationMs(text: string) {
  const normalized = String(text || '').trim().toLowerCase()

  if (normalized === 'one second' || normalized.startsWith('one second ')) return 2500
  if (normalized === 'hold on' || normalized.startsWith('hold on ')) return 4000
  if (normalized === 'give me a second' || normalized.startsWith('give me a second ')) return 3500
  if (normalized === 'give me a moment' || normalized.startsWith('give me a moment ')) return 6000
  if (normalized === 'let me think' || normalized.startsWith('let me think ')) return 5000

  return 0
}

function isBuyTimeSteeringPhrase(text: string) {
  return getBuyTimeDurationMs(text) > 0
}

export function isLiveSteeringPhrase(text: string) {
  const normalized = String(text || '').trim().toLowerCase()
  if (!normalized) return false

  return LIVE_STEERING_PHRASES.some((phrase) => normalized.includes(phrase))
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
      content: string
    }
  | {
      type: 'send'
      text: string
    }

export type LastLiveFinalTranscript = {
  text: string
  at: number
} | null

export type LiveTranscriptRoutingContext = {
  isThinking?: boolean
  isSpeaking?: boolean
  liveMode?: boolean
  buyTimeUntil?: number
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
  const text = String(params.text || '').trim()
  const now = params.now ?? Date.now()
  const last = params.lastFinalTranscript

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

  if (isBuyTimeSteeringPhrase(text)) {
    return {
      decision: {
        type: 'local',
        content: 'buy_time',
      },
      nextFinalTranscript: last,
    }
  }

  if (isRepeatLineSteeringPhrase(text)) {
    return {
      decision: {
        type: 'local',
        content: 'repeat_last_line',
      },
      nextFinalTranscript: last,
    }
  }

  if (last && last.text === text && now - last.at < 1800) {
    return {
      decision: {
        type: 'ignore',
        reason: 'duplicate_final_transcript',
      },
      nextFinalTranscript: last,
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
