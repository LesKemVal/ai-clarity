export type LiveFastPathResult =
  | {
      handled: true
      content: string
      serving: string[]
      source: 'live_fast_path'
    }
  | {
      handled: false
    }

export function tryLiveFastPath(params: {
  input: string
  room?: string | null
  chair?: string | null
  objective?: string | null
  recentAssistant?: string | null
}): LiveFastPathResult {
  const input = String(params.input || '').trim()
  const lower = input.toLowerCase()
  const objective = String(params.objective || '').trim()
  const room = String(params.room || '').trim()
  const chair = String(params.chair || '').trim()

  if (!input) return { handled: false }

  if (/^(can you hear me|are you listening|you there)[?.!\s]*$/i.test(input)) {
    return {
      handled: true,
      content: "Yes. I’m listening.",
      serving: ['Cues'],
      source: 'live_fast_path',
    }
  }

  if (/\b(what is|what's)\s+(my|the)\s+(desired outcome|objective|goal)\b/i.test(lower)) {
    if (!objective) return { handled: false }

    return {
      handled: true,
      content: `Your desired outcome is ${objective}.`,
      serving: ['Outcome'],
      source: 'live_fast_path',
    }
  }

  if (/\b(repeat that|say that again|again)\b/i.test(lower)) {
    const recent = String(params.recentAssistant || '').trim()
    if (!recent) return { handled: false }

    return {
      handled: true,
      content: recent,
      serving: ['Continuation'],
      source: 'live_fast_path',
    }
  }

  if (/\b(shorter|keep this tight|tighten it)\b/i.test(lower)) {
    return {
      handled: true,
      content: objective
        ? `Keep it tight: bring this back to ${objective}, then ask for the next clear step.`
        : "Keep it tight: make one point, ask one question, and stop.",
      serving: ['Cues', 'Advise'],
      source: 'live_fast_path',
    }
  }

  if (/\b(what should i say first|how should i start|open with)\b/i.test(lower)) {
    const target = objective || 'the outcome'
    const context = [chair, room].filter(Boolean).join(' in ')
    return {
      handled: true,
      content: context
        ? `Start here: “I want to frame this clearly from my position as ${context}. The outcome I’m trying to move toward is ${target}.”`
        : `Start here: “I want to frame this clearly. The outcome I’m trying to move toward is ${target}.”`,
      serving: ['Continuation', 'Advise'],
      source: 'live_fast_path',
    }
  }

  if (/\b(close with|close this|wrap this)\b/i.test(lower)) {
    return {
      handled: true,
      content: "Close with the next step, who owns it, and when it happens.",
      serving: ['Close', 'Cues'],
      source: 'live_fast_path',
    }
  }

  return { handled: false }
}
