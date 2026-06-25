export type EvidenceAuthorityResult = {
  violates: boolean
  reason: string
  unsupportedTerms: string[]
}

const INFERENCE_MARKERS =
  /\b(may|might|could|can|would|seems|appears|suggests|signals|likely|possibly|probably|potentially|risk|direction|moving toward|may be|could be|might be)\b/i

const ABSTRACT_CONTINUATION_TERMS = new Set([
  'because',
  'value',
  'clear',
  'clearly',
  'enough',
  'support',
  'supports',
  'outcome',
  'room',
  'understand',
  'evaluate',
  'evaluation',
  'matter',
  'matters',
  'staying',
  'next',
  'step',
  'way',
  'reason',
  'reasoning',
  'point',
  'objective',
  'trajectory',
  'signal',
  'signals',
  'forward',
  'conversation',
  'case',
  'goal',
])

const STRUCTURAL_TERMS = new Set([
  'the',
  'this',
  'that',
  'these',
  'those',
  'with',
  'without',
  'from',
  'into',
  'onto',
  'about',
  'around',
  'through',
  'before',
  'after',
  'while',
  'where',
  'when',
  'what',
  'which',
  'who',
  'whom',
  'whose',
  'there',
  'their',
  'they',
  'them',
  'we',
  'our',
  'ours',
  'you',
  'your',
  'yours',
  'and',
  'but',
  'for',
  'nor',
  'yet',
  'so',
  'not',
  'just',
  'also',
  'than',
  'then',
  'have',
  'has',
  'had',
  'will',
  'would',
  'could',
  'should',
  'might',
  'being',
  'been',
  'are',
  'was',
  'were',
  'is',
])

const HIGH_RISK_TERMS =
  /\b(parties?|counterpart(?:y|ies)|buyer|seller|entity|entities|company|companies|customer|customers|revenue|ebitda|margin|users?|contracts?|signed|committed|agreed|agreement|consensus|framework|major concerns|term sheet|execution|integration|integrating|merger|acquisition|licensing|license|partnership|joint venture|ipo|financing|strategic investment|market leader|global leader|industry leader|supplier|suppliers|bargaining power|negotiating power|market presence|combined entity|wife|husband|spouse|partner|children|kids|family)\b/gi

const NAMED_ENTITIES =
  /\b(microsoft|google|apple|amazon|meta|tesla|nvidia|openai|oracle|ibm|intel|netflix|uber|airbnb|salesforce)\b/gi

const FACTUAL_VERBS =
  /\b(reached|created|secured|agreed|committed|accepted|approved|resolved|addressed|established|confirmed|paving|sets the stage|marking|allowing|increase|increased|negotiate|negotiated)\b/i

function normalize(value: unknown) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim()
}

function words(value: string) {
  return normalize(value).match(/\b[a-z][a-z0-9'-]{3,}\b/g) || []
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

export function violatesEvidenceAuthority(output: string, evidence = ''): EvidenceAuthorityResult {
  const clean = String(output || '').trim()
  if (!clean) {
    return { violates: true, reason: 'empty_output', unsupportedTerms: [] }
  }

  const normalizedEvidence = normalize(evidence)
  const markedAsInference = INFERENCE_MARKERS.test(clean)

  const unsupportedNumbers = unique(
    clean.match(/\b\d+(?:\.\d+)?\s*(?:%|percent|shares?|months?|years?|dollars?|\$|billion|million|bn|m)\b/gi) || []
  ).filter((term) => !normalizedEvidence.includes(normalize(term)))

  if (unsupportedNumbers.length) {
    return { violates: true, reason: 'unsupported_number', unsupportedTerms: unsupportedNumbers }
  }

  const unsupportedNamedEntities = unique(
    Array.from(clean.matchAll(NAMED_ENTITIES)).map((match) => normalize(match[0]))
  ).filter((term) => !normalizedEvidence.includes(term))

  if (unsupportedNamedEntities.length && !markedAsInference) {
    return { violates: true, reason: 'unsupported_named_entity', unsupportedTerms: unsupportedNamedEntities }
  }

  const highRiskTerms = unique(
    Array.from(clean.matchAll(HIGH_RISK_TERMS)).map((match) => normalize(match[0]))
  ).filter((term) => !normalizedEvidence.includes(term))

  if (highRiskTerms.length && !markedAsInference) {
    return { violates: true, reason: 'unsupported_high_risk_fact', unsupportedTerms: highRiskTerms }
  }

  const substantiveTerms = unique(words(clean)).filter((term) => {
    if (normalizedEvidence.includes(term)) return false
    if (STRUCTURAL_TERMS.has(term)) return false
    if (ABSTRACT_CONTINUATION_TERMS.has(term)) return false
    return true
  })

  const propositionLike =
    /\b(the|these|those|both|all|our|their|we)\b/i.test(clean) ||
    FACTUAL_VERBS.test(clean)

  if (!markedAsInference && propositionLike && substantiveTerms.length >= 2) {
    return {
      violates: true,
      reason: 'unsupported_factual_proposition',
      unsupportedTerms: substantiveTerms.slice(0, 8),
    }
  }

  return { violates: false, reason: 'verified', unsupportedTerms: [] }
}
