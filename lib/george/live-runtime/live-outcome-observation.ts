export type LiveOutcomeSignal = 'WIN' | 'LOSS' | 'CALLBACK' | 'STALL'

export function detectLiveOutcomeSignal(text: string): LiveOutcomeSignal | null {
  const clean = String(text || '').toLowerCase()

  if (clean.includes('closed') || clean.includes('deal done')) return 'WIN'
  if (clean.includes('call me') || clean.includes('next week')) return 'CALLBACK'
  if (clean.includes('not interested') || clean.includes('no thanks')) return 'LOSS'
  if (clean.includes('send') || clean.includes('info')) return 'STALL'

  return null
}
