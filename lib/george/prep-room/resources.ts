import { interpretRoom } from '@/lib/george/prep-room/room-interpreter'

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

function resourcesFromRoom(contextText?: string | null): PrepRoomResourceProfile {
  const room = interpretRoom(contextText)

  if (room.roomType === 'negotiation') {
    return {
      ...DEFAULT_PREP_ROOM_RESOURCE_PROFILE,
      roomType: room.roomType,
      pressureLevel: room.pressure,
      recommendedPosture: 'negotiation',
      tone: 'firm, calm, and non-reactive',
      cadence: 'measured',
      compression: 'high',
      cueDensity: room.pressure === 'high' ? 'balanced' : 'light',
      interruptionHandling: 'controlled',
      bridgeStyle: 'validate pressure, then protect leverage',
      responseTexture: 'executive_concise',
      strategy: room.recommendedStrategy,
    }
  }

  if (room.roomType === 'professional meeting') {
    return {
      ...DEFAULT_PREP_ROOM_RESOURCE_PROFILE,
      roomType: room.roomType,
      pressureLevel: room.pressure,
      recommendedPosture: 'composed_executive',
      tone: 'calm, evidence-first, and credible',
      cadence: 'measured',
      compression: room.requiresCompression ? 'medium' : 'low',
      cueDensity: 'light',
      interruptionHandling: room.interruptionRisk > 0.5 ? 'assertive' : 'controlled',
      bridgeStyle: 'locate the disagreement before defending',
      responseTexture: 'executive_concise',
      strategy: room.recommendedStrategy,
    }
  }

  return {
    ...DEFAULT_PREP_ROOM_RESOURCE_PROFILE,
    roomType: room.roomType,
    pressureLevel: room.pressure,
    compression: room.requiresCompression ? 'medium' : 'low',
    strategy: room.recommendedStrategy,
  }
}

export function inferPrepRoomResources(input: {
  contextText?: string | null
  userOverride?: Partial<PrepRoomResourceProfile> | null
}): PrepRoomResourceProfile {
  let profile = resourcesFromRoom(input.contextText)

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
