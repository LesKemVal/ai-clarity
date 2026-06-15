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

function isBuyTimeSteeringPhrase(text: string) {
  const normalized = String(text || '').trim().toLowerCase()

  return [
    'one second',
    'hold on',
    'give me a second',
    'give me a moment',
    'let me think',
  ].some((phrase) => normalized === phrase || normalized.startsWith(`${phrase} `))
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
