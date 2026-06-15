export type LiveSteeringAction =
  | 'buy_time'
  | 'repeat_last_line'
  | 'compress_last_line'
  | 'say_it_this_way'
  | 'bring_it_back'
  | 'hold_the_line'
  | 'close_with'

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

const STANDALONE_FILLER_TOKENS = new Set([
  'yeah',
  'okay',
  'ok',
  'right',
  'mm',
  'uh',
  'um',
])

function isCompressLineSteeringPhrase(text: string) {
  return matchesLiveSteeringPhrase(text, getDefaultSteeringPhrases('compress_last_line'))
}

function isRepeatLineSteeringPhrase(text: string) {
  return matchesLiveSteeringPhrase(text, getDefaultSteeringPhrases('repeat_last_line'))
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

function isBuyTimeSteeringPhrase(text: string) {
  return getBuyTimeDurationMs(text) > 0
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

  if (isCompressLineSteeringPhrase(text)) {
    return {
      decision: {
        type: 'local',
        content: 'compress_last_line',
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
