export type SpeakerRole =
  | 'user'
  | 'authority'
  | 'decision_maker'
  | 'skeptic'
  | 'gatekeeper'
  | 'ally'
  | 'neutral'
  | 'unclear'

export type SpeakerRoleInference = {
  role: SpeakerRole
  confidence: number
  reason: string
}

export function inferSpeakerRole(
  text: string,
  speaker: 'other_party' | 'user' | 'unclear'
): SpeakerRoleInference {
  const clean = text.toLowerCase()

  if (speaker === 'user') {
    return {
      role: 'user',
      confidence: 0.9,
      reason: 'Speaker is the user.',
    }
  }

  if (speaker === 'unclear') {
    return {
      role: 'unclear',
      confidence: 0.35,
      reason: 'Speaker could not be identified clearly.',
    }
  }

  if (/officer|license|registration|step out|policy|compliance|security/i.test(clean)) {
    return {
      role: 'authority',
      confidence: 0.78,
      reason: 'Authority language detected.',
    }
  }

  if (/approve|decision|budget|sign off|authorized|final call/i.test(clean)) {
    return {
      role: 'decision_maker',
      confidence: 0.72,
      reason: 'Decision-control language detected.',
    }
  }

  if (/not interested|doesn't make sense|why should|prove|concern|problem|issue/i.test(clean)) {
    return {
      role: 'skeptic',
      confidence: 0.7,
      reason: 'Resistance or challenge language detected.',
    }
  }

  if (/send an email|he is busy|she is busy|what is this regarding|take a message/i.test(clean)) {
    return {
      role: 'gatekeeper',
      confidence: 0.74,
      reason: 'Access-control language detected.',
    }
  }

  if (/that makes sense|i agree|good point|fair enough|i see/i.test(clean)) {
    return {
      role: 'ally',
      confidence: 0.66,
      reason: 'Supportive alignment language detected.',
    }
  }

  return {
    role: 'neutral',
    confidence: 0.5,
    reason: 'No strong role signal detected.',
  }
}
