export type PrepRoomPosture =
  | 'composed_executive'
  | 'collaborative'
  | 'warm_authority'
  | 'direct'
  | 'technical_expert'
  | 'diplomatic'
  | 'negotiation'
  | 'investigative'

export type PrepRoomCadence = 'measured' | 'balanced' | 'sharp'
export type PrepRoomCompression = 'low' | 'medium' | 'high'
export type PrepRoomCueDensity = 'light' | 'balanced' | 'dense'
export type PrepRoomInterruptionHandling = 'passive' | 'controlled' | 'assertive'
export type PrepRoomResponseTexture =
  | 'natural_conversational'
  | 'executive_concise'
  | 'highly_tactical'
  | 'teaching_oriented'

export type PrepRoomResourceProfile = {
  roomType: string
  pressureLevel: 'low' | 'medium' | 'high'
  recommendedPosture: PrepRoomPosture
  tone: string
  cadence: PrepRoomCadence
  compression: PrepRoomCompression
  cueDensity: PrepRoomCueDensity
  interruptionHandling: PrepRoomInterruptionHandling
  bridgeStyle: string
  responseTexture: PrepRoomResponseTexture
  strategy: string
  userOverride: boolean
}

export const DEFAULT_PREP_ROOM_RESOURCE_PROFILE: PrepRoomResourceProfile = {
  roomType: 'general conversation',
  pressureLevel: 'low',
  recommendedPosture: 'collaborative',
  tone: 'calm and useful',
  cadence: 'balanced',
  compression: 'medium',
  cueDensity: 'light',
  interruptionHandling: 'controlled',
  bridgeStyle: 'context first, then strongest move',
  responseTexture: 'natural_conversational',
  strategy: 'understand the room, protect the objective, and keep the user moving',
  userOverride: false,
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term))
}

export function inferPrepRoomResources(input: {
  contextText?: string | null
  userOverride?: Partial<PrepRoomResourceProfile> | null
}): PrepRoomResourceProfile {
  const text = String(input.contextText || '').toLowerCase()
  let profile: PrepRoomResourceProfile = { ...DEFAULT_PREP_ROOM_RESOURCE_PROFILE }

  if (hasAny(text, ['meeting', 'board', 'executive', 'budget', 'numbers', 'deck', 'stakeholder'])) {
    profile = {
      ...profile,
      roomType: 'professional meeting',
      pressureLevel: hasAny(text, ['challenged', 'pushback', 'tense', 'defensive', 'pressure']) ? 'medium' : 'low',
      recommendedPosture: 'composed_executive',
      tone: 'calm, evidence-first, and credible',
      cadence: 'measured',
      compression: 'medium',
      cueDensity: 'light',
      interruptionHandling: 'controlled',
      bridgeStyle: 'locate the disagreement before defending',
      responseTexture: 'executive_concise',
      strategy: 'reconcile source, timeframe, and assumption before arguing the conclusion',
    }
  }

  if (hasAny(text, ['negotiat', 'deal', 'price', 'offer', 'counter', 'terms'])) {
    profile = {
      ...profile,
      roomType: 'negotiation',
      pressureLevel: 'medium',
      recommendedPosture: 'negotiation',
      tone: 'firm, calm, and non-reactive',
      cadence: 'measured',
      compression: 'high',
      cueDensity: 'balanced',
      interruptionHandling: 'controlled',
      bridgeStyle: 'validate pressure, then protect leverage',
      responseTexture: 'executive_concise',
      strategy: 'slow urgency, clarify interests, and trade concessions deliberately',
    }
  }

  if (hasAny(text, ['interview', 'hiring', 'recruiter', 'job', 'panel'])) {
    profile = {
      ...profile,
      roomType: 'interview',
      pressureLevel: 'medium',
      recommendedPosture: 'warm_authority',
      tone: 'confident, grounded, and specific',
      cadence: 'balanced',
      compression: 'medium',
      cueDensity: 'balanced',
      interruptionHandling: 'passive',
      bridgeStyle: 'answer directly, then prove with one example',
      responseTexture: 'natural_conversational',
      strategy: 'connect experience to the role without overexplaining',
    }
  }

  if (hasAny(text, ['doctor', 'medical', 'diagnosis', 'symptom', 'appointment'])) {
    profile = {
      ...profile,
      roomType: 'medical appointment',
      pressureLevel: 'medium',
      recommendedPosture: 'investigative',
      tone: 'clear, calm, and precise',
      cadence: 'measured',
      compression: 'medium',
      cueDensity: 'balanced',
      interruptionHandling: 'controlled',
      bridgeStyle: 'clarify what was said, then ask the next necessary question',
      responseTexture: 'teaching_oriented',
      strategy: 'protect understanding and get the next concrete medical step',
    }
  }

  if (input.userOverride) {
    profile = {
      ...profile,
      ...input.userOverride,
      userOverride: true,
    }
  }

  return profile
}

export function buildPrepRoomResourceSummary(profile: PrepRoomResourceProfile) {
  return {
    title: profile.roomType,
    pressure: profile.pressureLevel,
    recommendation: {
      posture: profile.recommendedPosture,
      tone: profile.tone,
      cadence: profile.cadence,
      compression: profile.compression,
      cueDensity: profile.cueDensity,
      interruptionHandling: profile.interruptionHandling,
      responseTexture: profile.responseTexture,
    },
    strategy: profile.strategy,
    bridgeStyle: profile.bridgeStyle,
    userOverride: profile.userOverride,
  }
}
