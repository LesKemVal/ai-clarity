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
    maxWords: 7,
    volume: 0.42,
    shouldWhisper: true,
    silenceBias: 0.72,
  },
  peer: {
    id: 'peer',
    label: 'Calm Peer',
    maxWords: 12,
    volume: 0.62,
    shouldWhisper: false,
    silenceBias: 0.45,
  },
  authority: {
    id: 'authority',
    label: 'Firm Authority',
    maxWords: 9,
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

  const words = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return words.slice(0, profile.maxWords).join(' ')
}
