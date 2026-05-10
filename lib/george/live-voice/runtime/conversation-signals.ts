export type ConversationalSignal =
  | 'authority_pressure'
  | 'interruption_attempt'
  | 'proof_challenge'
  | 'opening_window'
  | 'hesitation'
  | 'resistance'
  | 'defensive_language'

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
