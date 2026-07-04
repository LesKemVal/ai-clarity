export type LiveOutcomeSignal = 'WIN' | 'LOSS' | 'CALLBACK' | 'STALL'

export function detectLiveOutcomeSignal(text: string): LiveOutcomeSignal | null {
  const clean = String(text || '').toLowerCase()

  if (clean.includes('closed') || clean.includes('deal done')) return 'WIN'
  if (clean.includes('call me') || clean.includes('next week')) return 'CALLBACK'
  if (clean.includes('not interested') || clean.includes('no thanks')) return 'LOSS'
  if (clean.includes('send') || clean.includes('info')) return 'STALL'

  return null
}

export function recordLiveOutcomeSignal(params: {
  signal: LiveOutcomeSignal
  text: string
  now?: number
  limit?: number
}) {
  if (typeof window === 'undefined') return

  const history = JSON.parse(window.localStorage.getItem('GEORGE_OUTCOMES') || '[]')
  history.unshift({
    signal: params.signal,
    text: params.text,
    ts: params.now || Date.now(),
  })
  window.localStorage.setItem(
    'GEORGE_OUTCOMES',
    JSON.stringify(history.slice(0, params.limit || 50))
  )
}
