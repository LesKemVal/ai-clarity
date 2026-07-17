import type { LiveOutcomeSignal } from '@/lib/george/live-runtime/live-outcome-observation'

const LIVE_OUTCOME_HISTORY_KEY = 'GEORGE_OUTCOMES'

type LiveOutcomeRecord = {
  signal: LiveOutcomeSignal
  text: string
  ts: number
}

function readLiveOutcomeHistory(): LiveOutcomeRecord[] {
  if (typeof window === 'undefined') return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LIVE_OUTCOME_HISTORY_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function recordLiveOutcomeSignal(params: {
  signal: LiveOutcomeSignal
  text: string
  now?: number
  limit?: number
}) {
  if (typeof window === 'undefined') return

  const history = readLiveOutcomeHistory()
  history.unshift({
    signal: params.signal,
    text: params.text,
    ts: params.now || Date.now(),
  })

  window.localStorage.setItem(
    LIVE_OUTCOME_HISTORY_KEY,
    JSON.stringify(history.slice(0, params.limit || 50))
  )
}
