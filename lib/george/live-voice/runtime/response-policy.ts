import type { ConversationSignalState } from './conversation-signals'

export type LiveResponseMode =
  | 'authority'
  | 'hold_floor'
  | 'proof'
  | 'opening'
  | 'resistance'
  | 'direct'
  | 'instruction'

export type LiveResponsePolicy = {
  mode: LiveResponseMode
  volley: string
  cue: string
  status: string
  confidence?: number
}

export function selectLiveResponsePolicy(input: {
  speaker: 'other_party' | 'george_instruction' | 'unclear'
  signals: ConversationSignalState
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
}): LiveResponsePolicy {
  const { speaker, signals, roomPressure } = input

  if (speaker === 'other_party' && signals.has('authority_pressure')) {
    return {
      mode: 'authority',
      volley: roomPressure === 'authority'
        ? 'Yes, officer. May I reach for it?'
        : 'Let me answer that carefully.',
      cue: 'Hands visible. Move slowly.',
      status: 'Authority context. Stay calm.',
      confidence: 0.86,
    }
  }

  if (speaker === 'other_party' && signals.has('interruption_attempt')) {
    return {
      mode: 'hold_floor',
      volley: '',
      cue: 'Do not speak. Let them finish.',
      status: 'Other party holding the floor.',
    }
  }

  if (speaker === 'other_party' && signals.has('proof_challenge')) {
    return {
      mode: 'proof',
      volley: 'The clearest proof is this.',
      cue: 'Proof first. No extra words.',
      status: 'Proof challenge detected.',
    }
  }

  if (speaker === 'other_party' && signals.has('opening_window')) {
    return {
      mode: 'opening',
      volley: 'Here is the point.',
      cue: 'Use the opening.',
      status: 'Opening detected.',
    }
  }

  if (speaker === 'other_party' && signals.has('resistance')) {
    return {
      mode: 'resistance',
      volley: 'What would make this worth a short look?',
      cue: 'Redirect. Do not push harder.',
      status: 'Resistance detected.',
    }
  }

  if (speaker === 'other_party') {
    return {
      mode: 'direct',
      volley: 'Let me answer that directly.',
      cue: 'Slow down. Do not rush.',
      status: 'They asked for a response.',
    }
  }

  return {
    mode: 'instruction',
    volley: 'Say it plainly.',
    cue: 'Short. Calm. Direct.',
    status: 'Instruction received.',
    confidence: 0.6,
  }
}
