export type DeliveryProfileId =
  | 'whisperer'
  | 'peer'
  | 'authority'
  | 'silent'

export type DeliveryProfile = {
  id: DeliveryProfileId
  label: string
  maxWords: number
  volume: number
  shouldWhisper: boolean
  silenceBias: number
}

export const DELIVERY_PROFILES: Record<DeliveryProfileId, DeliveryProfile> = {
  whisperer: {
    id: 'whisperer',
    label: 'Tactical Whisperer',
    maxWords: 14,
    volume: 0.42,
    shouldWhisper: true,
    silenceBias: 0.72,
  },
  peer: {
    id: 'peer',
    label: 'Calm Peer',
    maxWords: 22,
    volume: 0.62,
    shouldWhisper: false,
    silenceBias: 0.45,
  },
  authority: {
    id: 'authority',
    label: 'Firm Authority',
    maxWords: 18,
    volume: 0.55,
    shouldWhisper: false,
    silenceBias: 0.52,
  },
  silent: {
    id: 'silent',
    label: 'Silent Cues Only',
    maxWords: 0,
    volume: 0,
    shouldWhisper: false,
    silenceBias: 1,
  },
}

export function compressForDelivery(text: string, profile: DeliveryProfile) {
  if (profile.maxWords <= 0) return ''

  const clean = text.replace(/\s+/g, ' ').trim()
  const words = clean.split(/\s+/).filter(Boolean)

  if (words.length <= profile.maxWords) return clean

  const sentenceBoundary = clean.match(/^(.+?[.!?])\s+/)
  if (sentenceBoundary) {
    const sentenceWords = sentenceBoundary[1].split(/\s+/).filter(Boolean)
    if (sentenceWords.length <= profile.maxWords + 4) {
      return sentenceBoundary[1]
    }
  }

  return words.slice(0, profile.maxWords).join(' ')
}
