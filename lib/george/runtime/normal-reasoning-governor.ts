export type NormalGeorgeReasoningLane = 'immediate' | 'operational' | 'strategic'

export type NormalGeorgeProvider = 'openai' | 'groq'

export type NormalGeorgeReasoningDecision = {
  lane: NormalGeorgeReasoningLane
  provider: NormalGeorgeProvider
  model: string
  reason: string
}

type NormalGeorgeReasoningInput = {
  userText: string
  tier: string
  hasImageInput: boolean
}

function isSafeNormalFastLaneRequest(userText: string) {
  const text = String(userText || '').trim()
  const words = text.split(/\s+/).filter(Boolean).length

  if (!text || words > 120) return false

  return /\b(rewrite|grammar|format|shorten|summarize|bullet|fix (?:this )?typo|clean this up|make this clearer|make this shorter|proofread|correct the spelling|change the tone|translate)\b/i.test(text)
}

function scoreComplexity(userText: string) {
  const text = String(userText || '').trim()
  const lower = text.toLowerCase()
  const words = text.split(/\s+/).filter(Boolean).length

  let score = 0
  const reasons: string[] = []

  if (words > 90) {
    score += 2
    reasons.push('long request')
  } else if (words > 35) {
    score += 1
    reasons.push('moderate request length')
  }

  if (/\b(strategy|negotiate|negotiation|investor|contract|terms|risk|decision|tradeoff|business plan|pitch deck|board|presentation|interview|proposal|roadmap|market|pricing|deal|offer|counteroffer|crowdfunding|fundraising|capital raise|broker dealer|non-accredited|reg cf|regulation crowdfunding|reg a|reg d)\b/i.test(lower)) {
    score += 3
    reasons.push('consequential work')
  }

  if (/\b(compare|decide|recommend|evaluate|analyze|pressure test|stress test|build|plan|create|prepare|review)\b/i.test(lower)) {
    score += 1
    reasons.push('judgment requested')
  }

  if (/\b(rewrite|grammar|format|summarize|shorten|bullet|fix typo|clean this up|make this clearer)\b/i.test(lower) && words < 80) {
    score -= 2
    reasons.push('simple transformation')
  }

  if (/\b(now|quick|fast|briefly|short answer|one line|one paragraph)\b/i.test(lower)) {
    score -= 1
    reasons.push('speed or brevity requested')
  }

  return {
    score,
    reason: reasons.length ? reasons.join('; ') : 'ordinary normal GEORGE request',
  }
}

export function resolveNormalGeorgeReasoning(input: NormalGeorgeReasoningInput): NormalGeorgeReasoningDecision {
  const sharedBaselineModel =
    process.env.OPENAI_MODEL_INTELLIGENT ||
    process.env.OPENAI_MODEL ||
    'gpt-4o'

  const latestModel =
    process.env.OPENAI_MODEL_BRILLIANT ||
    process.env.OPENAI_MODEL_LATEST ||
    process.env.OPENAI_MODEL ||
    'gpt-5'

  if (input.hasImageInput) {
    return {
      lane: 'strategic',
      provider: 'openai',
      model:
        input.tier === 'brilliant'
          ? latestModel
          : process.env.OPENAI_MODEL_VISION || sharedBaselineModel,
      reason: 'image input requires vision-capable reasoning',
    }
  }

  const { score, reason } = scoreComplexity(input.userText)
  const tier =
    input.tier === 'brilliant' || input.tier === 'intelligent'
      ? input.tier
      : 'smart'

  const lane: NormalGeorgeReasoningLane =
    score >= 3
      ? 'strategic'
      : score >= 1
        ? 'operational'
        : 'immediate'

  const useGroqFastLane =
    lane === 'immediate' &&
    isSafeNormalFastLaneRequest(input.userText) &&
    Boolean(process.env.GROQ_API_KEY?.trim())

  return {
    lane,
    provider: useGroqFastLane ? 'groq' : 'openai',
    model: useGroqFastLane
      ? (process.env.GROQ_NORMAL_FAST_MODEL ||
          process.env.GROQ_FAST_MODEL ||
          'llama-3.1-8b-instant')
      : tier === 'brilliant' && lane !== 'immediate'
        ? latestModel
        : sharedBaselineModel,
    reason: useGroqFastLane
      ? `${reason}; safe normal fast lane`
      : reason,
  }
}
