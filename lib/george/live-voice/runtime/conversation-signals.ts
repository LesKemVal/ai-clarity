export type ConversationalSignal =
  | 'authority_pressure'
  | 'interruption_attempt'
  | 'proof_challenge'
  | 'opening_window'
  | 'hesitation'
  | 'resistance'
  | 'defensive_language'
  | 'interviewer_probe'
  | 'behavioral_question'
  | 'competency_test'
  | 'weak_confidence'

export type ConversationSignalState = {
  signals: ConversationalSignal[]
  has: (signal: ConversationalSignal) => boolean
}

const SIGNAL_PATTERNS: Record<ConversationalSignal, RegExp> = {
  authority_pressure:
    /(officer|license|registration|insurance|step out|policy|compliance|security|id\b)/i,

  interruption_attempt:
    /(hold on|wait|stop|listen|let me finish|answer me|you're not hearing me)/i,

  proof_challenge:
    /(why should|prove|evidence|convince me|that doesn't sound right|that does not sound right)/i,

  opening_window:
    /(okay,? go ahead|go ahead|your turn|i'm listening|im listening|you can answer)/i,

  hesitation:
    /\b(uh|um|maybe|i guess|not sure|we will see|later)\b/i,

  resistance:
    /(not interested|too busy|send an email|no budget|not now)/i,

  defensive_language:
    /(sorry|i just|what i meant|i was only|let me explain)/i,

  interviewer_probe:
    /(tell me about yourself|walk me through|why do you want|why should we hire|what are your strengths|what are your weaknesses)/i,

  behavioral_question:
    /(tell me about a time|give me an example|describe a time|how did you handle|what would you do if)/i,

  competency_test:
    /(experience with|familiar with|how would you approach|what tools|what systems|what process|can you explain)/i,

  weak_confidence:
    /\b(i think|kind of|sort of|maybe|i guess|not really sure|i don't know)\b/i,
}

export function detectConversationSignals(
  text: string
): ConversationSignalState {
  const clean = text.toLowerCase()

  const signals = (
    Object.entries(SIGNAL_PATTERNS) as [ConversationalSignal, RegExp][]
  )
    .filter(([, pattern]) => pattern.test(clean))
    .map(([signal]) => signal)

  return {
    signals,
    has(signal) {
      return signals.includes(signal)
    },
  }
}
