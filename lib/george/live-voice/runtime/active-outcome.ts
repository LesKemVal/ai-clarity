export type ActiveOutcomeInput = {
  desiredOutcome?: string
  room?: string
  transcript?: string
  userPosition?: string
  knownContext?: string
}

function text(value: unknown) {
  return String(value || '').toLowerCase().trim()
}

function includesAny(source: string, terms: string[]) {
  return terms.some((term) => source.includes(term))
}

export function deriveActiveOutcome(input: ActiveOutcomeInput) {
  const desiredOutcome = text(input.desiredOutcome)
  const room = text(input.room)
  const transcript = text(input.transcript)
  const userPosition = text(input.userPosition)
  const knownContext = text(input.knownContext)
  const combined = [desiredOutcome, room, transcript, userPosition, knownContext].join(' ')

  if (!combined.trim()) {
    return 'Establish the active outcome without over-collecting information.'
  }

  if (
    includesAny(combined, ['leadership', 'manage', 'managed', 'team', 'led ', 'supervisor'])
  ) {
    return 'Demonstrate leadership credibility.'
  }

  if (
    includesAny(combined, ['why did you leave', 'left your last', 'fired', 'termination', 'gap'])
  ) {
    return 'Reduce concern and protect reliability.'
  }

  if (
    includesAny(combined, ['salary', 'compensation', 'offer', 'counter', 'terms'])
  ) {
    return 'Protect leverage while keeping the opportunity alive.'
  }

  if (
    includesAny(combined, ['numbers', 'forecast', 'projection', 'variance', 'assumption', 'methodology'])
  ) {
    return 'Protect credibility by clarifying the basis of the claim.'
  }

  if (
    includesAny(combined, ['objection', 'pushback', 'challenged', 'concern', 'hesitation'])
  ) {
    return 'Identify the concern and protect the desired outcome.'
  }

  if (
    includesAny(room, ['interview']) ||
    includesAny(desiredOutcome, ['job', 'hired', 'offer'])
  ) {
    return 'Convert the current question into evidence the user deserves the role.'
  }

  if (
    includesAny(room, ['negotiation']) ||
    includesAny(userPosition, ['negotiating'])
  ) {
    return 'Preserve leverage while moving toward agreement.'
  }

  if (
    includesAny(room, ['board', 'meeting', 'executive'])
  ) {
    return 'Preserve credibility and move the room toward a decision.'
  }

  return 'Advance the desired outcome through the current room signal.'
}
