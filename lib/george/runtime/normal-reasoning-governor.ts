export type NormalGeorgeReasoningLane = 'immediate' | 'operational' | 'strategic'

export type NormalGeorgeReasoningDecision = {
  lane: NormalGeorgeReasoningLane
  model: string
  reason: string
}

type NormalGeorgeReasoningInput = {
  userText: string
  tier: string
  hasImageInput: boolean
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
  if (input.hasImageInput) {
    return {
      lane: 'strategic',
      model: process.env.OPENAI_MODEL_VISION || 'gpt-4o',
      reason: 'image input requires vision-capable reasoning',
    }
  }

  const { score, reason } = scoreComplexity(input.userText)
  const tier = input.tier === 'brilliant' || input.tier === 'intelligent' ? input.tier : 'smart'

  const lane: NormalGeorgeReasoningLane =
    score >= 3 ? 'strategic' :
    score >= 1 ? 'operational' :
    'immediate'

  if (lane === 'strategic') {
    return {
      lane,
      model:
        tier === 'brilliant'
          ? (process.env.OPENAI_MODEL_BRILLIANT || process.env.OPENAI_MODEL || 'gpt-5')
          : tier === 'intelligent'
            ? (process.env.OPENAI_MODEL_INTELLIGENT || process.env.OPENAI_MODEL || 'gpt-4o')
            : (
              process.env.OPENAI_MODEL_INTELLIGENT ||
              process.env.OPENAI_MODEL ||
              'gpt-4o'
            ),
      reason,
    }
  }

  if (lane === 'operational') {
    return {
      lane,
      model:
        process.env.OPENAI_MODEL_INTELLIGENT ||
        process.env.OPENAI_MODEL ||
        'gpt-4o',
      reason,
    }
  }

  return {
    lane,
    model: process.env.OPENAI_MODEL_SMART || 'gpt-4o-mini',
    reason,
  }
}
