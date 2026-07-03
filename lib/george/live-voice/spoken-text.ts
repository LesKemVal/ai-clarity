export const BRAND_SPEECH_DICTIONARY = {
  GEORGE: 'George',
  BRANESx: 'Brains',
  SMART: 'Smart',
  INTELLIGENT: 'Intelligent',
  BRILLIANT: 'Brilliant',
} as const

export function normalizeBrandSpeech(text: string) {
  let output = String(text || '')

  for (const [written, spoken] of Object.entries(BRAND_SPEECH_DICTIONARY)) {
    output = output.replace(
      new RegExp(`\\b${written}\\b`, 'g'),
      spoken,
    )
  }

  return output
}

export function normalizeTextForSpeech(text: string) {
  return normalizeBrandSpeech(text)
}
