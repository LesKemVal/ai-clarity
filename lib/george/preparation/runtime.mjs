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

function preparationNow() {
  return Date.now()
}

function preparationTurnId(input = {}, startedAt = preparationNow()) {
  return clean(input.turnId) || clean(input.runtimeTurnId) || `preparation_${startedAt}`
}

function logPreparationLatency(turnId, event, payload = {}) {
  console.info('[GEORGE][preparation][latency]', {
    event,
    turnId,
    ...payload,
  })
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'for', 'from', 'help', 'i',
  'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'prepare', 'the', 'to',
  'with', 'this', 'that', 'before', 'after', 'next', 'prior', 'conversation',
])

function normalizeWords(value = '') {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
}

function overlapScore(leftValue = '', rightValue = '') {
  const left = new Set(normalizeWords(leftValue))
  const right = new Set(normalizeWords(rightValue))

  if (!left.size || !right.size) return 0

  let overlap = 0
  for (const item of left) {
    if (right.has(item)) overlap += 1
  }

  return overlap / Math.max(left.size, right.size)
}

function documentationText(items) {
  return normalizeList(items).map(textFromItem).filter(Boolean).join(' ')
}

function packageEvidenceText(pkg = {}) {
  return [
    clean(pkg.desiredOutcome),
    clean(pkg.conversationType),
    clean(pkg.conversationContext),
    clean(pkg.conversationWith),
    documentationText(pkg.relevantDocumentation),
    ...packageSummaries(pkg).map(textFromItem),
    ...packageLearning(pkg).map(textFromItem),
    ...normalizeList(pkg.futureActions).map(textFromItem),
  ].filter(Boolean).join(' ')
}

function scoreRelatedConversationPackage(target = {}, candidate = {}) {
  const targetOutcome = clean(target.desiredOutcome)
  const targetContext = clean(target.conversationContext)
  const targetDocs = documentationText(target.relevantDocumentation)
  const candidateEvidence = packageEvidenceText(candidate)

  const objectiveScore = overlapScore(targetOutcome, candidateEvidence)
  const contextScore = overlapScore(targetContext, candidateEvidence)
  const documentationScore = overlapScore(targetDocs, candidateEvidence)
  const typeScore =
    clean(target.conversationType) &&
    clean(candidate.conversationType) &&
    clean(target.conversationType).toLowerCase() === clean(candidate.conversationType).toLowerCase()
      ? 0.12
      : 0

  return Math.min(
    1,
    Number((objectiveScore * 0.5 + contextScore * 0.25 + documentationScore * 0.13 + typeScore).toFixed(3))
  )
}

export function selectRelatedConversationPackages(input = {}) {
  const startedAt = preparationNow()
  const turnId = preparationTurnId(input, startedAt)
  const targetPackage = input.conversationPackage || input.package || {}
  const record = input.conversationRecord || input.record || {}
  const candidates = normalizeList(input.relatedConversationPackages || input.relatedPackages)
  const target = {
    ...targetPackage,
    desiredOutcome: clean(input.desiredOutcome) || clean(targetPackage.desiredOutcome) || clean(record.desiredOutcome),
    conversationContext: [
      clean(targetPackage.conversationContext),
      clean(record.conversationContext),
      clean(record.summary),
    ].filter(Boolean).join(' '),
    relevantDocumentation: [
      ...normalizeList(targetPackage.relevantDocumentation),
      ...normalizeList(record.relevantDocumentation),
    ],
  }

  const maxPackages = Math.max(1, Number(input.maxRelatedConversationPackages || 3))
  const minScore = typeof input.minRelatedConversationPackageScore === 'number'
    ? input.minRelatedConversationPackageScore
    : 0.18

  const selected = candidates
    .map((candidate, index) => ({
      candidate,
      score: scoreRelatedConversationPackage(target, candidate),
      index,
    }))
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, maxPackages)
    .map(({ candidate, score }) => ({
      ...candidate,
      preparationRelevanceScore: score,
    }))

  logPreparationLatency(turnId, 'related_package_selection_complete', {
    at: preparationNow(),
    durationMs: preparationNow() - startedAt,
    candidateCount: candidates.length,
    selectedCount: selected.length,
    maxPackages,
    minScore,
  })

  return selected
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

function deriveReusableDocumentation(pkg, desiredOutcome, knownContext) {
  const docs = normalizeList(pkg.relevantDocumentation)
  const combined = `${desiredOutcome} ${knownContext.join(' ')}`.toLowerCase()

  return docs
    .map((doc) => {
      const title = textFromItem(doc)
      if (!title) return null

      const titleLower = title.toLowerCase()
      const reusable =
        includesAny(combined, titleLower.split(/\s+/).filter((word) => word.length > 3)) ||
        includesAny(titleLower, ['deck', 'metrics', 'resume', 'description', 'medication', 'timeline', 'model'])

      return {
        id: typeof doc === 'string' ? title : clean(doc.id) || title,
        title,
        type: typeof doc === 'string' ? 'document' : clean(doc.type) || 'document',
        reusable,
        reason: reusable
          ? 'Already attached to this Conversation Package and may improve this preparation.'
          : 'Attached to this Conversation Package.',
      }
    })
    .filter(Boolean)
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

function deriveOpportunities(desiredOutcome, knownContext, learning, futureActions = []) {
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

  for (const action of futureActions) {
    const line = clean(action)
    if (line) opportunities.push(`Use prior post-LIVE action: ${line}`)
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

function confidenceScore({ desiredOutcome, knownContext, docs, learning, futureActions, missingSignals }) {
  let score = 0.28
  if (desiredOutcome) score += 0.2
  if (knownContext.length) score += 0.18
  if (docs.length) score += 0.14
  if (learning.length) score += 0.12
  if (futureActions.length) score += 0.06
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

function packageSummaries(pkg = {}) {
  return normalizeList(pkg.liveSummaries || pkg.conversationSummaries)
}

function packageLearning(pkg = {}) {
  return normalizeList(pkg.learning).filter((item) => {
    const decision = clean(item?.decision)
    return !decision || decision === 'promote' || decision === 'hold_for_more_evidence'
  })
}

export function prepareConversationFromPackage(input = {}) {
  const startedAt = preparationNow()
  const turnId = preparationTurnId(input, startedAt)

  logPreparationLatency(turnId, 'preparation_started', {
    at: startedAt,
  })

  const pkg = input.conversationPackage || input.package || {}
  const record = input.conversationRecord || input.record || {}
  const selectionStartedAt = preparationNow()
  const relatedPackages = selectRelatedConversationPackages({
    ...input,
    turnId,
  })

  const relatedPackageSelectionDurationMs = preparationNow() - selectionStartedAt
  const desiredOutcome = clean(input.desiredOutcome) || clean(pkg.desiredOutcome) || clean(record.desiredOutcome)

  const assemblyStartedAt = preparationNow()

  const summaries = [
    ...normalizeList(input.summaries || packageSummaries(pkg)),
    ...relatedPackages.flatMap(packageSummaries),
    record.summary ? { summary: record.summary, source: 'conversation_record' } : null,
  ].filter(Boolean)

  const learning = [
    ...normalizeList(input.learning || packageLearning(pkg)),
    ...relatedPackages.flatMap(packageLearning),
    ...normalizeList(record.learning),
    record.latestLearning || null,
  ].filter((item) => {
    if (!item) return false
    const decision = clean(item.decision)
    return !decision || decision === 'promote' || decision === 'hold_for_more_evidence'
  })

  const docs = [
    ...normalizeList(input.relevantDocumentation || pkg.relevantDocumentation),
    ...relatedPackages.flatMap((item) => normalizeList(item.relevantDocumentation)),
    ...normalizeList(record.relevantDocumentation),
  ]

  const futureActions = [
    ...normalizeList(pkg.futureActions),
    ...relatedPackages.flatMap((item) => normalizeList(item.futureActions)),
    ...normalizeList(record.futureActions),
  ]

  const relatedContext = relatedPackages
    .map((item) => clean(item.conversationContext))
    .filter(Boolean)

  const packageForPreparation = {
    ...pkg,
    relevantDocumentation: docs,
    conversationContext: [
      clean(pkg.conversationContext) || clean(record.conversationContext),
      ...relatedContext,
    ].filter(Boolean).join(' | '),
  }

  const profileLearningSignals = learning
    .filter((item) => clean(item?.type) === 'communication_pattern')
    .map((item) => ({
      hypothesis: clean(item?.hypothesis || item?.learning || item?.evidence),
      confidence: Number(item?.confidence || 0.5),
    }))

  const knownContext = buildKnownContext(packageForPreparation, summaries, learning)
  const reusableDocumentation = deriveReusableDocumentation(packageForPreparation, desiredOutcome, knownContext)
  const documentationSuggestions = deriveDocumentationSuggestions(packageForPreparation, desiredOutcome, knownContext)
  const risks = deriveRisks(desiredOutcome, knownContext)
  const opportunities = deriveOpportunities(desiredOutcome, knownContext, learning, futureActions)
  const missingSignals = deriveMissingSignals(packageForPreparation, desiredOutcome, knownContext, documentationSuggestions)
  const confidence = confidenceScore({ desiredOutcome, knownContext, docs, learning, futureActions, missingSignals })
  const optionalQuestion = deriveOptionalQuestion(missingSignals, risks)

  const assemblyDurationMs = preparationNow() - assemblyStartedAt
  const totalDurationMs = preparationNow() - startedAt

  logPreparationLatency(turnId, 'preparation_assembly_complete', {
    at: preparationNow(),
    durationMs: assemblyDurationMs,
    knownContextCount: knownContext.length,
    documentationCount: docs.length,
    learningCount: learning.length,
    profileLearningSignalCount: profileLearningSignals.length,
    futureActionCount: futureActions.length,
  })

  logPreparationLatency(turnId, 'preparation_complete', {
    at: preparationNow(),
    totalDurationMs,
    relatedPackageSelectionDurationMs,
    assemblyDurationMs,
    selectedRelatedPackageCount: relatedPackages.length,
    confidence,
    sufficientToBegin: Boolean(desiredOutcome) && confidence >= 0.42,
  })

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
    reusableDocumentation,
    documentationSuggestions,
    risks,
    opportunities,
    relatedConversationPackageSelection: relatedPackages.map((item) => ({
      id: item.id || null,
      score: item.preparationRelevanceScore,
    })),
    preparationLatency: {
      turnId,
      totalDurationMs,
      relatedPackageSelectionDurationMs,
      assemblyDurationMs,
      selectedRelatedPackageCount: relatedPackages.length,
    },
    confidence,
    optionalQuestion,
    sufficientToBegin: Boolean(desiredOutcome) && confidence >= 0.42,
  }
}
