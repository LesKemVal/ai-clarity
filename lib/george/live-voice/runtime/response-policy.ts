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
  tone?: 'calm' | 'firm' | 'neutral'
  compression?: 'low' | 'medium' | 'high'
  deliveryStyle?: 'direct' | 'proof' | 'redirect' | 'silence'
  intervention?: 'hold' | 'speak' | 'redirect'
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
      tone: 'calm',
      compression: 'high',
      deliveryStyle: 'direct',
      intervention: 'speak',
    }
  }

  if (speaker === 'other_party' && signals.has('interruption_attempt')) {
    return {
      mode: 'hold_floor',
      volley: '',
      cue: 'Do not speak. Let them finish.',
      status: 'Other party holding the floor.',
      tone: 'calm',
      compression: 'high',
      deliveryStyle: 'silence',
      intervention: 'hold',
    }
  }

  if (speaker === 'other_party' && signals.has('proof_challenge')) {
    return {
      mode: 'proof',
      volley: 'The clearest proof is this.',
      cue: 'Proof first. No extra words.',
      status: 'Proof challenge detected.',
      tone: 'firm',
      compression: 'medium',
      deliveryStyle: 'proof',
      intervention: 'speak',
    }
  }

  if (speaker === 'other_party' && signals.has('opening_window')) {
    return {
      mode: 'opening',
      volley: 'Here is the point.',
      cue: 'Use the opening.',
      status: 'Opening detected.',
      tone: 'neutral',
      compression: 'medium',
      deliveryStyle: 'direct',
      intervention: 'speak',
    }
  }


  if (speaker === 'other_party' && signals.has('interviewer_probe')) {
    return {
      mode: 'direct',
      volley: 'Give them the clearest version.',
      cue: 'Confident. Specific. No rambling.',
      status: 'Interview probe detected.',
      tone: 'calm',
      compression: 'high',
      deliveryStyle: 'direct',
      intervention: 'speak',
    }
  }

  if (speaker === 'other_party' && signals.has('behavioral_question')) {
    return {
      mode: 'direct',
      volley: 'Use one strong example.',
      cue: 'Situation. Action. Result.',
      status: 'Behavioral interview question detected.',
      tone: 'neutral',
      compression: 'high',
      deliveryStyle: 'direct',
      intervention: 'speak',
    }
  }

  if (speaker === 'other_party' && signals.has('competency_test')) {
    return {
      mode: 'proof',
      volley: 'Answer with direct experience.',
      cue: 'Specific tools. Specific results.',
      status: 'Competency verification detected.',
      tone: 'firm',
      compression: 'medium',
      deliveryStyle: 'proof',
      intervention: 'speak',
    }
  }

  if (speaker === 'other_party' && signals.has('weak_confidence')) {
    return {
      mode: 'instruction',
      volley: 'Remove uncertainty from the answer.',
      cue: 'Shorter. Firmer. Cleaner.',
      status: 'Weak confidence language detected.',
      tone: 'firm',
      compression: 'high',
      deliveryStyle: 'direct',
      intervention: 'redirect',
    }
  }

  if (speaker === 'other_party' && signals.has('resistance')) {
    return {
      mode: 'resistance',
      volley: 'What would make this worth a short look?',
      cue: 'Redirect. Do not push harder.',
      status: 'Resistance detected.',
      tone: 'calm',
      compression: 'medium',
      deliveryStyle: 'redirect',
      intervention: 'redirect',
    }
  }

  if (speaker === 'other_party') {
    return {
      mode: 'direct',
      volley: 'Let me answer that directly.',
      cue: 'Slow down. Do not rush.',
      status: 'They asked for a response.',
      tone: 'neutral',
      compression: 'medium',
      deliveryStyle: 'direct',
      intervention: 'speak',
    }
  }

  return {
    mode: 'instruction',
    volley: 'Say it plainly.',
    cue: 'Short. Calm. Direct.',
    status: 'Instruction received.',
    confidence: 0.6,
    tone: 'neutral',
    compression: 'high',
    deliveryStyle: 'direct',
    intervention: 'speak',
  }
}
