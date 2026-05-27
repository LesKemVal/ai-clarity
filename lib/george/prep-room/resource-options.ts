import type {
  PrepRoomCadence,
  PrepRoomCompression,
  PrepRoomCueDensity,
  PrepRoomInterruptionHandling,
  PrepRoomPosture,
  PrepRoomResponseTexture,
} from '@/lib/george/prep-room/resources'

type Option<T extends string> = {
  value: T
  label: string
  description: string
  bestFor?: string
}

export const PREP_ROOM_POSTURE_OPTIONS: Option<PrepRoomPosture>[] = [
  {
    value: 'composed_executive',
    label: 'Composed executive',
    description: 'Calm, concise, evidence-first, and credible under scrutiny.',
    bestFor: 'boardrooms, budget reviews, executive meetings, and high-standard professional rooms',
  },
  {
    value: 'collaborative',
    label: 'Collaborative',
    description: 'Keeps the room cooperative while still protecting the objective.',
  },
  {
    value: 'warm_authority',
    label: 'Warm authority',
    description: 'Confident and human without becoming stiff or overly forceful.',
    bestFor: 'interviews, leadership conversations, relationship repair, and client trust-building',
  },
  {
    value: 'direct',
    label: 'Direct',
    description: 'Clear and efficient with minimal softening.',
  },
  {
    value: 'technical_expert',
    label: 'Technical expert',
    description: 'Precise, methodical, and grounded in definitions, sources, and assumptions.',
  },
  {
    value: 'diplomatic',
    label: 'Diplomatic',
    description: 'Careful, face-saving, and relationship-aware without losing direction.',
  },
  {
    value: 'negotiation',
    label: 'Negotiation',
    description: 'Protects leverage, slows urgency, and trades concessions deliberately.',
  },
  {
    value: 'investigative',
    label: 'Investigative',
    description: 'Clarifies facts, asks disciplined questions, and avoids premature conclusions.',
  },
]

export const PREP_ROOM_CADENCE_OPTIONS: Option<PrepRoomCadence>[] = [
  {
    value: 'measured',
    label: 'Measured',
    description: 'Slower, steadier pacing for rooms where control and credibility matter.',
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Natural pacing for most conversations.',
  },
  {
    value: 'sharp',
    label: 'Sharp',
    description: 'Fast, concise, and decisive when time or pressure is high.',
  },
]

export const PREP_ROOM_COMPRESSION_OPTIONS: Option<PrepRoomCompression>[] = [
  {
    value: 'low',
    label: 'Low',
    description: 'More room for explanation and context.',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Balanced guidance with enough detail to stay useful.',
  },
  {
    value: 'high',
    label: 'High',
    description: 'Short, high-signal support for live pressure or tight windows.',
  },
]

export const PREP_ROOM_CUE_DENSITY_OPTIONS: Option<PrepRoomCueDensity>[] = [
  {
    value: 'light',
    label: 'Light cues',
    description: 'GEORGE intervenes only for high-leverage moments, major corrections, or clear openings.',
    bestFor: 'users who mainly want presence, not frequent interruption',
  },
  {
    value: 'balanced',
    label: 'Balanced cues',
    description: 'GEORGE provides important next moves, corrections, and opportunities without crowding the user.',
    bestFor: 'most LIVE conversations',
  },
  {
    value: 'dense',
    label: 'Dense cues',
    description: 'GEORGE gives frequent support for training, difficult rooms, or conversations where the user wants close guidance.',
    bestFor: 'practice, high uncertainty, or complex conversations',
  },
]

export const PREP_ROOM_INTERRUPTION_OPTIONS: Option<PrepRoomInterruptionHandling>[] = [
  {
    value: 'passive',
    label: 'Passive',
    description: 'GEORGE avoids interruption control unless the user clearly needs help.',
  },
  {
    value: 'controlled',
    label: 'Controlled',
    description: 'GEORGE helps the user hold the floor calmly when interruptions affect the objective.',
  },
  {
    value: 'assertive',
    label: 'Assertive',
    description: 'GEORGE gives stronger floor-control cues when the room is combative or the user is being cut off.',
  },
]

export const PREP_ROOM_RESPONSE_TEXTURE_OPTIONS: Option<PrepRoomResponseTexture>[] = [
  {
    value: 'natural_conversational',
    label: 'Natural conversational',
    description: 'Human, flexible, and lightly structured.',
  },
  {
    value: 'executive_concise',
    label: 'Executive concise',
    description: 'Brief, credible, and decision-oriented.',
  },
  {
    value: 'highly_tactical',
    label: 'Highly tactical',
    description: 'More direct next-move support, wording, and pressure handling.',
  },
  {
    value: 'teaching_oriented',
    label: 'Teaching oriented',
    description: 'Explains what is happening so the user can understand and improve.',
  },
]

export function getPrepRoomResourceOptions() {
  return {
    posture: PREP_ROOM_POSTURE_OPTIONS,
    cadence: PREP_ROOM_CADENCE_OPTIONS,
    compression: PREP_ROOM_COMPRESSION_OPTIONS,
    cueDensity: PREP_ROOM_CUE_DENSITY_OPTIONS,
    interruptionHandling: PREP_ROOM_INTERRUPTION_OPTIONS,
    responseTexture: PREP_ROOM_RESPONSE_TEXTURE_OPTIONS,
  }
}
