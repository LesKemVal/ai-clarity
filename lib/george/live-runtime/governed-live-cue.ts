export type GovernedLiveCueRuntimeMemory = {
  overrideCount?: number
  acceptedCarryCount?: number
  hesitationCount?: number
  preferredForce?: string
  toneCorrection?: string
  roomCommunicationNotes?: string[]
}

function addRoomNote(memory: GovernedLiveCueRuntimeMemory, note: string) {
  memory.roomCommunicationNotes = [
    ...(memory.roomCommunicationNotes || []),
    note,
  ].slice(-5)
}

export function applyGovernedLiveCueRuntimeMemory(
  memory: GovernedLiveCueRuntimeMemory,
  transcript: string,
  allowed: boolean
) {
  const lower = String(transcript || '').toLowerCase()
  const clean = lower.trim()

  if (/^(ok|okay|got it|i got it|i've got it|ive got it)$/.test(clean)) {
    memory.overrideCount = Number(memory.overrideCount || 0) + 1
    memory.preferredForce =
      Number(memory.overrideCount || 0) >= 3 ? 'light' : memory.preferredForce
  }

  if (/^(ok|okay|hold|pause|wait|stop)$/.test(clean) && !allowed) {
    memory.overrideCount = Number(memory.overrideCount || 0) + 1
    memory.preferredForce =
      Number(memory.overrideCount || 0) >= 3 ? 'light' : memory.preferredForce
  }

  if (/hmm|maybe|i guess|i don’t know|i don't know|i dont know/.test(lower)) {
    memory.hesitationCount = Number(memory.hesitationCount || 0) + 1
    addRoomNote(memory, 'User hesitated; preserve clarity and reduce cognitive load.')
  }

  if (/\b(softer|soften|less aggressive|gentler|calmer)\b/i.test(lower)) {
    memory.toneCorrection = 'softer'
    addRoomNote(memory, 'User requested softer communication in this room.')
  }

  if (/\b(firmer|stronger|more direct|be direct|sharper)\b/i.test(lower)) {
    memory.toneCorrection = 'firmer'
    addRoomNote(memory, 'User requested firmer communication in this room.')
  }

  if (/\b(shorter|tighten|compress|too much|less)\b/i.test(lower)) {
    addRoomNote(memory, 'User prefers tighter language in this room.')
  }

  if (!allowed) return false

  memory.acceptedCarryCount = Number(memory.acceptedCarryCount || 0) + 1

  if (Number(memory.acceptedCarryCount || 0) >= 3 && Number(memory.overrideCount || 0) < 2) {
    memory.preferredForce = 'strong'
  }

  return true
}
