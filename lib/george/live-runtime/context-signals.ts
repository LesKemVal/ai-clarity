export function appendLiveContextSignal(
  currentSignals: string[],
  nextSignal: string,
  limit = 12
) {
  const clean = String(nextSignal || '').trim()
  if (!clean) return currentSignals.slice(-limit)

  return [...currentSignals, clean].slice(-limit)
}
