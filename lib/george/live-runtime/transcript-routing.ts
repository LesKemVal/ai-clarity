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
