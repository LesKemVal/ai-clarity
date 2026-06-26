export type EvidenceAuthorityResult = {
  violates: boolean
  reason: string
  unsupportedTerms: string[]
}

const INFERENCE_MARKERS =
  /\b(may|might|could|can|would|seems|appears|suggests|signals|likely|possibly|probably|potentially|risk|direction|moving toward|may be|could be|might be)\b/i

const STRUCTURAL_TERMS = new Set([
  'the','this','that','these','those','with','without','from','into','onto','about','around','through',
  'before','after','while','where','when','what','which','who','there','their','they','them','we','our',
  'you','your','and','but','for','yet','so','not','just','also','than','then','have','has','had','will',
  'would','could','should','might','being','been','are','was','were','is','because','allowing',
])

const ABSTRACT_CONTINUATION_TERMS = new Set([
  'value','clear','clearly','enough','support','supports','outcome','room','understand','evaluate',
  'evaluation','matter','matters','staying','next','step','way','reason','reasoning','point','objective',
  'trajectory','signal','signals','forward','conversation','case','goal','useful','strongest','active',
])

const HIGH_RISK_TERMS =
  /\b(parties?|counterpart(?:y|ies)|buyer|seller|entity|entities|company|companies|customer|customers|revenue|ebitda|margin|users?|contracts?|signed|committed|agreed|agreement|consensus|framework|major concerns|key terms|relevant parties|negotiation process|smooth and efficient|term sheet|execution|integration|integrating|merger|acquisition|licensing|license|partnership|joint venture|ipo|financing|strategic investment|market leader|global leader|industry leader|supplier|suppliers|bargaining power|negotiating power|market presence|combined entity|wife|husband|spouse|partner|children|kids|family)\b/gi

const NAMED_ENTITIES =
  /\b(microsoft|google|apple|amazon|meta|tesla|nvidia|openai|oracle|ibm|intel|netflix|uber|airbnb|salesforce)\b/gi

const GENERIC_UNSUPPORTED_CONCLUSIONS =
  /\b(game[- ]changer|global economy|far[- ]reaching|implications|trade|investment|job creation|transformational|historic|unprecedented|revolutionary|ripple effects?|worldwide impact|economic impact|industry landscape|significant shift|major shift|creates jobs?|create jobs?|changes everything)\b/gi

const FACTUAL_VERBS =
  /\b(reached|created|secured|agreed|committed|accepted|approved|resolved|addressed|established|confirmed|paving|sets the stage|marking|allowing|increase|increased|negotiate|negotiated|creates?|becomes?|impacts?|changes?|drives?|positions?)\b/i

function normalize(value: unknown) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim()
}

function words(value: string) {
  return normalize(value).match(/\b[a-z][a-z0-9'-]{3,}\b/g) || []
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function splitClauses(output: string) {
  return String(output || '')
    .replace(/^\.\.\./, '')
    .split(/[,;.!?]|\s+\b(?:and|but|while|which|that)\b\s+/i)
    .map((clause) => clause.trim())
    .filter(Boolean)
}

function unsupportedMatches(pattern: RegExp, clean: string, evidence: string) {
  return unique(Array.from(clean.matchAll(pattern)).map((match) => normalize(match[0])))
    .filter((term) => term && !evidence.includes(term))
}

function unsupportedSubstantiveTerms(clause: string, evidence: string) {
  return unique(words(clause)).filter((term) => {
    if (evidence.includes(term)) return false
    if (STRUCTURAL_TERMS.has(term)) return false
    if (ABSTRACT_CONTINUATION_TERMS.has(term)) return false
    return true
  })
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

  const entityTerms = unsupportedMatches(NAMED_ENTITIES, clean, normalizedEvidence)
  if (entityTerms.length && !markedAsInference) {
    return { violates: true, reason: 'unsupported_named_entity', unsupportedTerms: entityTerms }
  }

  const highRiskTerms = unsupportedMatches(HIGH_RISK_TERMS, clean, normalizedEvidence)
  if (highRiskTerms.length && !markedAsInference) {
    return { violates: true, reason: 'unsupported_high_risk_fact', unsupportedTerms: highRiskTerms }
  }

  const genericConclusions = unsupportedMatches(GENERIC_UNSUPPORTED_CONCLUSIONS, clean, normalizedEvidence)
  if (genericConclusions.length && !markedAsInference) {
    return { violates: true, reason: 'unsupported_conclusion', unsupportedTerms: genericConclusions }
  }

  if (/^\.\.\.\s*(alright|okay|let's|we'll|we need|we are|we're)\b/i.test(clean)) {
    return { violates: true, reason: 'unsupported_continuation_takeover', unsupportedTerms: [clean.slice(0, 40)] }
  }

  const continuationAssertionMarkers =
    /\b(we believe|we know|we have|we've|our analysts|our team|the deal gives|this gives us|will give us|puts us|gives us a seat|seat at the table|shape the future direction|future direction of)\b/gi

  const unsupportedAssertions = unsupportedMatches(
    continuationAssertionMarkers,
    clean,
    normalizedEvidence
  )

  if (unsupportedAssertions.length) {
    return {
      violates: true,
      reason: 'unsupported_asserted_continuation',
      unsupportedTerms: unsupportedAssertions,
    }
  }

  for (const clause of splitClauses(clean)) {
    const clauseMarkedAsInference = INFERENCE_MARKERS.test(clause)
    if (clauseMarkedAsInference) continue

    const propositionLike =
      /\b(the|these|those|both|all|our|their|we|this|that)\b/i.test(clause) ||
      FACTUAL_VERBS.test(clause)

    if (!propositionLike) continue

    const unsupportedTerms = unsupportedSubstantiveTerms(clause, normalizedEvidence)

    if (unsupportedTerms.length >= 2) {
      return {
        violates: true,
        reason: 'unsupported_factual_clause',
        unsupportedTerms: unsupportedTerms.slice(0, 8),
      }
    }
  }

  return { violates: false, reason: 'verified', unsupportedTerms: [] }
}
