export type SignalSufficiencyResult = {
  sufficient: boolean
  confidence: number
  missingSignal?: string
}

const HIGH_VALUE_SIGNALS = [
  'outcome',
  'purview',
  'context',
  'authority',
  'asset',
  'risk',
]

export function evaluateSignalSufficiency(input: {
  transcript: string
  outcome?: string
  context?: string
}) : SignalSufficiencyResult {
  const text = `${input.transcript} ${input.outcome || ''} ${input.context || ''}`.toLowerCase()

  let score = 0

  if (
    /\b(need|want|trying to|get hired|raise|appointment|contract|deal|job|investor|sale)\b/.test(text)
  ) score++

  if (
    /\b(revenue|churn|forecast|customer|pricing|board|manager|boss|investor|athlete|client)\b/.test(text)
  ) score++

  if (
    /\b(10%|deadline|budget|approved|ceo|already|last chance|challenged)\b/.test(text)
  ) score++

  if (score >= 2) {
    return {
      sufficient: true,
      confidence: Math.min(0.55 + score * 0.1, 0.95),
    }
  }

  return {
    sufficient: false,
    confidence: 0.45,
    missingSignal: HIGH_VALUE_SIGNALS[0],
  }
}
