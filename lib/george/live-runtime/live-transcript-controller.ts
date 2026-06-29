import { compressLiveLine } from './line-transforms'
import { getBuyTimeDurationMs, type LiveTranscriptDecision } from './transcript-routing'

export type LiveTranscriptControllerAction =
  | { type: 'ignore' }
  | { type: 'start_buy_time'; durationMs: number }
  | { type: 'speak'; text: string }
  | { type: 'send'; text: string }

export function resolveLiveTranscriptDecision(params: {
  decision: LiveTranscriptDecision
  transcript: string
  lastSpokenLine: string
}): LiveTranscriptControllerAction {
  const { decision } = params

  if (decision.type === 'ignore') {
    return { type: 'ignore' }
  }

  if (decision.type === 'send') {
    return { type: 'send', text: decision.text }
  }

  if (decision.content === 'buy_time') {
    return {
      type: 'start_buy_time',
      durationMs: getBuyTimeDurationMs(params.transcript),
    }
  }

  if (decision.content === 'repeat_last_line') {
    const lastLine = String(params.lastSpokenLine || '').trim()

    return lastLine
      ? { type: 'speak', text: lastLine }
      : { type: 'ignore' }
  }

  if (decision.content === 'compress_last_line') {
    const compressedLine = compressLiveLine(params.lastSpokenLine)

    return compressedLine
      ? { type: 'speak', text: compressedLine }
      : { type: 'ignore' }
  }

  if (decision.content === 'awareness_check') {
    return { type: 'send', text: 'Anything?' }
  }

  return { type: 'ignore' }
}
