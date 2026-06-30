function clean(value) {
  return String(value || '').trim()
}

function normalizeList(value) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
}

function textFromItem(item) {
  if (typeof item === 'string') return clean(item)
  return clean(item.title) || clean(item.name) || clean(item.evidence) || clean(item.summary) || clean(item.outcome) || clean(item.id)
}

function includesAny(text, terms) {
  const lower = clean(text).toLowerCase()
  return terms.some((term) => lower.includes(term))
}

function buildKnownContext(pkg, summaries, learning) {
  const parts = []

  if (clean(pkg.conversationContext)) parts.push(pkg.conversationContext)
  if (clean(pkg.conversationWith)) parts.push(`Conversation with: ${pkg.conversationWith}`)
  if (clean(pkg.role)) parts.push(`User role: ${pkg.role}`)

  for (const summary of summaries) {
    const line = textFromItem(summary)
    if (line) parts.push(line)
  }

  for (const item of learning) {
    const line = textFromItem(item)
    if (line) parts.push(line)
  }

  return parts
}

function deriveDocumentationSuggestions(pkg, desiredOutcome, knownContext) {
  const docs = normalizeList(pkg.relevantDocumentation)
  const existing = docs.map(textFromItem).filter(Boolean)
  const combined = `${desiredOutcome} ${knownContext.join(' ')}`

  const suggestions = []

  if (includesAny(combined, ['investor', 'funding', 'raise', 'traction', 'retention'])) {
    for (const item of ['Pitch deck', 'Retention metrics', 'Financial model']) {
      if (!existing.some((doc) => doc.toLowerCase().includes(item.toLowerCase()))) suggestions.push(item)
    }
  }

  if (includesAny(combined, ['interview', 'job', 'recruiter'])) {
    for (const item of ['Resume', 'Job description', 'Example answers']) {
      if (!existing.some((doc) => doc.toLowerCase().includes(item.toLowerCase()))) suggestions.push(item)
    }
  }

  if (includesAny(combined, ['doctor', 'medical', 'appointment', 'medication'])) {
    for (const item of ['Medication list', 'Symptom timeline', 'Questions for doctor']) {
      if (!existing.some((doc) => doc.toLowerCase().includes(item.toLowerCase()))) suggestions.push(item)
    }
  }

  return suggestions
}

function deriveRisks(desiredOutcome, knownContext) {
  const combined = `${desiredOutcome} ${knownContext.join(' ')}`.toLowerCase()
  const risks = []

  if (includesAny(combined, ['retention', 'acquisition cost', 'risk'])) {
    risks.push('The other party may need proof before accepting the claim.')
  }

  if (includesAny(combined, ['interview', 'job'])) {
    risks.push('Answers may need concise evidence instead of general confidence.')
  }

  if (includesAny(combined, ['doctor', 'medical', 'medication'])) {
    risks.push('Important details may be missed if symptoms, dates, or medications are not organized.')
  }

  return risks
}

function deriveOpportunities(desiredOutcome, knownContext, learning) {
  const combined = `${desiredOutcome} ${knownContext.join(' ')}`.toLowerCase()
  const opportunities = []

  if (includesAny(combined, ['follow-up', 'second meeting', 'investor'])) {
    opportunities.push('Use the strongest proof to move the conversation toward a specific next step.')
  }

  if (learning.some((item) => clean(item.type) === 'communication_pattern')) {
    opportunities.push('Apply known communication patterns that have improved this outcome before.')
  }

  if (learning.some((item) => clean(item.type) === 'person')) {
    opportunities.push('Use known person-specific context to make the conversation more precise.')
  }

  return opportunities
}

function deriveMissingSignals(pkg, desiredOutcome, knownContext, documentationSuggestions) {
  const missing = []

  if (!desiredOutcome) missing.push('Desired Outcome')
  if (!clean(pkg.conversationWith)) missing.push('Conversation With')
  if (!knownContext.length) missing.push('Conversation Context')
  if (documentationSuggestions.length >= 2) missing.push('Relevant Documentation')

  return missing
}

function confidenceScore({ desiredOutcome, knownContext, docs, learning, missingSignals }) {
  let score = 0.28
  if (desiredOutcome) score += 0.2
  if (knownContext.length) score += 0.18
  if (docs.length) score += 0.14
  if (learning.length) score += 0.12
  score -= Math.min(0.24, missingSignals.length * 0.06)
  return Number(Math.max(0.12, Math.min(0.94, score)).toFixed(2))
}

function deriveOptionalQuestion(missingSignals, risks) {
  if (missingSignals.includes('Desired Outcome')) {
    return 'What outcome would make this conversation successful?'
  }

  if (missingSignals.includes('Conversation With')) {
    return 'Who is this conversation with?'
  }

  if (missingSignals.includes('Relevant Documentation')) {
    return 'Is there one document that would materially improve this conversation?'
  }

  if (risks.length) {
    return 'What proof or example would make your position stronger?'
  }

  return ''
}

export function prepareConversationFromPackage(input = {}) {
  const pkg = input.conversationPackage || input.package || {}
  const desiredOutcome = clean(input.desiredOutcome) || clean(pkg.desiredOutcome)

  const summaries = normalizeList(input.summaries || pkg.liveSummaries || pkg.conversationSummaries)
  const learning = normalizeList(input.learning || pkg.learning).filter((item) => {
    const decision = clean(item.decision)
    return !decision || decision === 'promote' || decision === 'hold_for_more_evidence'
  })
  const docs = normalizeList(input.relevantDocumentation || pkg.relevantDocumentation)

  const knownContext = buildKnownContext(pkg, summaries, learning)
  const documentationSuggestions = deriveDocumentationSuggestions(pkg, desiredOutcome, knownContext)
  const risks = deriveRisks(desiredOutcome, knownContext)
  const opportunities = deriveOpportunities(desiredOutcome, knownContext, learning)
  const missingSignals = deriveMissingSignals(pkg, desiredOutcome, knownContext, documentationSuggestions)
  const confidence = confidenceScore({ desiredOutcome, knownContext, docs, learning, missingSignals })
  const optionalQuestion = deriveOptionalQuestion(missingSignals, risks)

  return {
    source: 'preparation-runtime',
    desiredOutcome,
    preparationBrief: [
      desiredOutcome ? `Prepare toward: ${desiredOutcome}` : '',
      knownContext.length ? `Known context: ${knownContext.slice(0, 3).join(' | ')}` : '',
      opportunities.length ? `Opportunity: ${opportunities[0]}` : '',
      risks.length ? `Risk: ${risks[0]}` : '',
    ].filter(Boolean).join('\n'),
    knownContext,
    missingSignals,
    documentationSuggestions,
    risks,
    opportunities,
    confidence,
    optionalQuestion,
    sufficientToBegin: Boolean(desiredOutcome) && confidence >= 0.42,
  }
}
