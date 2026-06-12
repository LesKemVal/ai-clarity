export type ObjectiveShiftVisibility = 'private_to_george' | 'room_visible' | 'needs_phone_update' | 'none'

export type ObjectiveShiftSignal = {
  detected: boolean
  visibility: ObjectiveShiftVisibility
  confidence: number
  reason: string
  suggestedOutcomes: string[]
  instruction: string
}

export type ObjectiveShiftInput = {
  transcript: string
  currentObjective?: string
  roomSignal?: string
  speaker?: 'user' | 'other_party' | 'george_instruction' | 'unclear'
}

const DIRECT_PRIVATE_OBJECTIVE_PATTERNS = [
  /\bwhat i need now is\b/i,
  /\bmy objective now is\b/i,
  /\bmy goal now is\b/i,
  /\bi need to change the goal\b/i,
  /\bnew objective\b/i,
]

const ROOM_VISIBLE_OBJECTIVE_PATTERNS = [
  /\blet'?s see if we can\b/i,
  /\bcan we shift this toward\b/i,
  /\bi think what we need here is\b/i,
  /\bwhat i'?d like to do now is\b/i,
]

const OBJECTIVE_DRIFT_HINTS = [
  /\bi don'?t think i want\b/i,
  /\bthis changes things\b/i,
  /\bi need a different outcome\b/i,
  /\bthat'?s not the priority anymore\b/i,
  /\bmaybe the goal is\b/i,
  /\bactually, i need\b/i,
  /\bwe may need to pivot\b/i,
  /\bi need a minute\b/i,
  /\bgive me one second\b/i,
  /\bcan we take a quick break\b/i,
]

const OUTCOME_CANDIDATES = [
  'Buy more time',
  'Preserve the relationship',
  'Exit professionally',
  'Get clarity',
  'De-escalate',
  'Secure a specific next step',
  'Return to the original objective',
  'Write my own',
]

function clean(value: unknown) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function matchesAny(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value))
}

function inferCandidates(transcript: string, currentObjective?: string) {
  const text = transcript.toLowerCase()
  const candidates: string[] = []

  if (/time|pause|later|delay|minute|break/.test(text)) candidates.push('Buy more time')
  if (/relationship|trust|rapport|respect|good terms/.test(text)) candidates.push('Preserve the relationship')
  if (/exit|leave|end|walk away|professionally/.test(text)) candidates.push('Exit professionally')
  if (/clarity|understand|clear|confused/.test(text)) candidates.push('Get clarity')
  if (/calm|de-escalate|heated|tension|argument/.test(text)) candidates.push('De-escalate')
  if (/next step|follow up|specific|commit/.test(text)) candidates.push('Secure a specific next step')

  if (currentObjective && clean(currentObjective)) {
    candidates.push('Return to the original objective')
  }

  candidates.push('Write my own')

  return Array.from(new Set([...candidates, ...OUTCOME_CANDIDATES])).slice(0, 8)
}

export function detectObjectiveShift(input: ObjectiveShiftInput): ObjectiveShiftSignal {
  const transcript = clean(input.transcript)
  const normalized = transcript.toLowerCase()

  if (!transcript || input.speaker === 'other_party') {
    return {
      detected: false,
      visibility: 'none',
      confidence: 0,
      reason: 'No user objective-shift signal detected.',
      suggestedOutcomes: [],
      instruction: '',
    }
  }

  const privateDirect = matchesAny(normalized, DIRECT_PRIVATE_OBJECTIVE_PATTERNS)
  const roomVisible = matchesAny(normalized, ROOM_VISIBLE_OBJECTIVE_PATTERNS)
  const driftHint = matchesAny(normalized, OBJECTIVE_DRIFT_HINTS)

  if (privateDirect) {
    return {
      detected: true,
      visibility: 'private_to_george',
      confidence: 0.9,
      reason: 'User used explicit private objective-update language.',
      suggestedOutcomes: inferCandidates(transcript, input.currentObjective),
      instruction: 'Update GEORGE privately. If the exact wording matters, offer quick phone selection and edit.',
    }
  }

  if (roomVisible) {
    return {
      detected: true,
      visibility: 'room_visible',
      confidence: 0.82,
      reason: 'User appears to be stating a new objective aloud to the room.',
      suggestedOutcomes: inferCandidates(transcript, input.currentObjective),
      instruction: 'Support the public pivot without exposing hidden strategy.',
    }
  }

  if (driftHint) {
    return {
      detected: true,
      visibility: 'needs_phone_update',
      confidence: 0.68,
      reason: 'User hinted the objective may have changed but did not provide exact new wording.',
      suggestedOutcomes: inferCandidates(transcript, input.currentObjective),
      instruction: 'Prepare a private phone update card so the user can tap the closest new outcome and edit for exactness.',
    }
  }

  return {
    detected: false,
    visibility: 'none',
    confidence: 0,
    reason: 'No objective-shift pattern detected.',
    suggestedOutcomes: [],
    instruction: '',
  }
}

export const GEORGE_OBJECTIVE_SHIFT_DOCTRINE = {
  minorRoomChange: 'GEORGE adapts automatically when the room changes but the desired outcome remains intact.',
  majorOutcomeChange: 'When the desired outcome may have changed, GEORGE prepares private candidate outcomes for quick phone selection and exact editing.',
  userInstruction: 'If the objective changes substantially, take a moment and update GEORGE. GEORGE may prepare likely options when it detects objective drift.',
  privatePattern: 'What I need now is... / My objective now is...',
  publicPattern: 'Let\'s see if we can...',
  acknowledgement: 'Ok. I recognize the new objective.',
} as const
