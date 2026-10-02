import { rankLiveSupportTags } from './live-support-ranking'

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
  preferredServingTags?: string[] | null
}): LiveFastPathResult {
  const input = String(params.input || '').trim()
  const lower = input.toLowerCase()
  const objective = String(params.objective || '').trim()

  if (!input) return { handled: false }

  const serve = (tags: string[]) =>
    rankLiveSupportTags(tags, params.preferredServingTags)

  if (/^(can you hear me|are you listening|you there)[?.!\s]*$/i.test(input)) {
    return {
      handled: true,
      content: "Yes. I’m listening.",
      serving: serve(['Cues']),
      source: 'live_fast_path',
    }
  }

  if (/\b(what is|what's)\s+(my|the)\s+(desired outcome|objective|goal)\b/i.test(lower)) {
    if (!objective) return { handled: false }

    return {
      handled: true,
      content: `Your desired outcome is ${objective}.`,
      serving: serve(['Outcome']),
      source: 'live_fast_path',
    }
  }

  if (/\b(repeat that|say that again|again)\b/i.test(lower)) {
    const recent = String(params.recentAssistant || '').trim()
    if (!recent) return { handled: false }

    return {
      handled: true,
      content: recent,
      serving: serve(['Continuation']),
      source: 'live_fast_path',
    }
  }

  return { handled: false }
}
