export type GeorgeCapabilityRequestKind =
  | 'none'
  | 'explicit_request'
  | 'inferred_opportunity'

export type GeorgeProviderSemanticIntent = Readonly<{
  capability: string | null
  capabilityRequestKind: GeorgeCapabilityRequestKind
  confidence: number
  executionContext: string | null
  source: 'provider_semantic_intent'
}>

export const EMPTY_GEORGE_PROVIDER_SEMANTIC_INTENT: GeorgeProviderSemanticIntent =
  Object.freeze({
    capability: null,
    capabilityRequestKind: 'none',
    confidence: 0,
    executionContext: null,
    source: 'provider_semantic_intent',
  })

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

export function normalizeGeorgeProviderSemanticIntent(
  value: unknown
): GeorgeProviderSemanticIntent {
  if (!value || typeof value !== 'object') {
    return EMPTY_GEORGE_PROVIDER_SEMANTIC_INTENT
  }

  const candidate = value as Record<string, unknown>
  const capability =
    typeof candidate.capability === 'string' && candidate.capability.trim()
      ? candidate.capability.trim()
      : null
  const requestKind = candidate.capabilityRequestKind
  const capabilityRequestKind: GeorgeCapabilityRequestKind =
    requestKind === 'explicit_request' ||
    requestKind === 'inferred_opportunity'
      ? requestKind
      : 'none'
  const rawConfidence =
    typeof candidate.confidence === 'number'
      ? candidate.confidence
      : Number(candidate.confidence)
  const confidence = Number.isFinite(rawConfidence)
    ? clamp01(rawConfidence)
    : 0
  const executionContext =
    typeof candidate.executionContext === 'string' &&
    candidate.executionContext.trim()
      ? candidate.executionContext.trim()
      : null

  if (!capability || capabilityRequestKind === 'none') {
    return EMPTY_GEORGE_PROVIDER_SEMANTIC_INTENT
  }

  return Object.freeze({
    capability,
    capabilityRequestKind,
    confidence,
    executionContext,
    source: 'provider_semantic_intent',
  })
}

export function buildGeorgeProviderSemanticIntentInstruction() {
  return `
PROVIDER SEMANTIC INTENT CONTRACT
- Use the same understanding that produces the user-facing response to identify whether the user explicitly requested a GEORGE capability or whether a capability is only an inferred opportunity.
- Do not classify capability requests by matching phrases or keywords.
- Do not create separate Normal and LIVE interpretations. GEORGE has one shared understanding; operating mode changes execution and delivery only.
- An explicit capability request is authoritative for the current turn and must not be downgraded into a recommendation.
- An inferred opportunity remains advisory.
- Return capability as the product capability requested or inferred, capabilityRequestKind as none, explicit_request, or inferred_opportunity, confidence from 0 to 1, and executionContext only when the current situation supplies one.
`.trim()
}
