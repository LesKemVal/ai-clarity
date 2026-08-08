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

export function discoverOperationalAssets(input = {}) {
  const pkg = input.conversationPackage || input.package || {}
  const record = input.conversationRecord || input.record || {}
  const relatedPackages = normalizeList(input.relatedConversationPackages || input.relatedPackages)
  const documents = [
    ...normalizeList(input.relevantDocumentation),
    ...normalizeList(pkg.relevantDocumentation),
    ...relatedPackages.flatMap((item) => normalizeList(item.relevantDocumentation)),
    ...normalizeList(record.relevantDocumentation),
  ].filter(Boolean).map((item) => ({
    id: typeof item === 'string' ? clean(item) : clean(item?.id) || clean(item?.name) || clean(item?.title),
    title: textFromItem(item),
    type: typeof item === 'string' ? 'document' : clean(item?.type) || 'document',
    updatedAt: typeof item === 'string' ? 0 : Number(item?.updatedAt || item?.createdAt || 0),
  })).filter((item) => item.title)

  const scripts = [
    ...normalizeList(input.scripts),
    ...normalizeList(pkg.scripts),
    ...normalizeList(record.scripts),
  ].filter(Boolean).map((item) => ({ id: clean(item?.id), title: textFromItem(item), type: 'script' })).filter((item) => item.title)

  const formulas = [
    input.formula || null,
    pkg.formulaSelection || null,
    ...normalizeList(input.formulas),
    ...normalizeList(pkg.formulas),
  ].filter(Boolean).map((item) => ({ id: clean(item?.id || item?.formulaId), title: textFromItem(item), type: 'formula' })).filter((item) => item.title || item.id)

  const briefings = [
    ...relatedPackages,
    input.previousBriefing || null,
    pkg.previousBriefing || null,
  ].filter(Boolean).map((item) => ({ id: clean(item?.id), title: textFromItem(item), type: 'briefing' })).filter((item) => item.title || item.id)

  const existing = [...documents, ...scripts, ...formulas, ...briefings]
  const requiredSignals = input.requiredOperationalSignals || determineOperationalSignalRequirements(input)
  const relevantExisting = existing.filter((item) => {
    const haystack = `${item.title} ${item.type}`.toLowerCase()
    return requiredSignals.some((signal) => signal.keywords.some((keyword) => haystack.includes(keyword)))
  })

  return {
    requiredSignals,
    existing: relevantExisting,
    recommendations: relevantExisting
      .slice()
      .sort((left, right) => Number(right.updatedAt || 0) - Number(left.updatedAt || 0))
      .slice(0, 3),
    confirmationRequired: relevantExisting.length > 0,
    missing: requiredSignals
      .filter((signal) => !relevantExisting.some((item) => signal.keywords.some((keyword) => `${item.title} ${item.type}`.toLowerCase().includes(keyword))))
      .map((signal) => signal.label),
  }
}

export function determineOperationalSignalRequirements(input = {}) {
  const objective = `${clean(input.desiredOutcome)} ${clean(input.conversationPackage?.desiredOutcome)} ${clean(input.conversationPackage?.conversationType)} ${clean(input.conversationPackage?.conversationContext)}`.toLowerCase()
  if (/interview|job|candidate|hiring/.test(objective)) {
    return [
      { key: 'resume', label: 'Resume', keywords: ['resume', 'cv', 'curriculum'] },
      { key: 'job_description', label: 'Job description', keywords: ['job description', 'role description', 'position'] },
    ]
  }
  if (/investor|funding|capital|valuation|pitch/.test(objective)) {
    return [
      { key: 'pitch_deck', label: 'Pitch deck', keywords: ['pitch', 'deck', 'presentation'] },
      { key: 'financials', label: 'Financials', keywords: ['financial', 'metrics', 'model'] },
      { key: 'capital_objective', label: 'Capital objective', keywords: ['capital', 'funding', 'raise', 'valuation'] },
    ]
  }
  if (/sales|prospect|buyer|pricing|proposal/.test(objective)) {
    return [
      { key: 'proposal', label: 'Proposal', keywords: ['proposal', 'offer', 'quote'] },
      { key: 'pricing', label: 'Pricing', keywords: ['pricing', 'price', 'margin'] },
      { key: 'objections', label: 'Known objections', keywords: ['objection', 'crm', 'customer'] },
    ]
  }
  return [
    { key: 'conversation_context', label: 'Conversation context', keywords: ['context', 'brief', 'agenda', 'meeting'] },
    { key: 'supporting_evidence', label: 'Supporting evidence', keywords: ['evidence', 'notes', 'document', 'script', 'formula'] },
  ]
}

export function prepareConversationFromPackage(input = {}) {
  const startedAt = preparationNow()
  const turnId = preparationTurnId(input, startedAt)

  logPreparationLatency(turnId, 'preparation_started', {
    at: startedAt,
  })

  const pkg = input.conversationPackage || input.package || {}
  const record = input.conversationRecord || input.record || {}
  const requiredOperationalSignals = determineOperationalSignalRequirements(input)
  const assetDiscovery = discoverOperationalAssets({ ...input, requiredOperationalSignals })
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
    formulaSelection: pkg.formulaSelection || null,
    preparationBrief: [
      desiredOutcome ? `Prepare toward: ${desiredOutcome}` : '',
      knownContext.length ? `Known context: ${knownContext.slice(0, 3).join(' | ')}` : '',
      opportunities.length ? `Opportunity: ${opportunities[0]}` : '',
      risks.length ? `Risk: ${risks[0]}` : '',
    ].filter(Boolean).join('\n'),
    knownContext,
    missingSignals,
    assetDiscovery,
    reusableDocumentation,
    documentationSuggestions,
    risks,
    opportunities,
    profileLearningSignals,
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

export function createConversationalBriefingTurn(input = {}) {
  const userText = clean(input.userText || input.transcript || input.text)
  const modality = input.modality === 'voice' ? 'voice' : 'text'
  const priorConversation = clean(input.conversationContext)
  const conversationContext = [priorConversation, userText].filter(Boolean).join(' | ')
  const preparation = prepareConversationFromPackage({
    ...input,
    conversationPackage: {
      ...(input.conversationPackage || input.package || {}),
      conversationContext,
    },
  })

  return {
    modality,
    userText,
    preparation,
    briefingDraft: {
      objective: preparation.desiredOutcome,
      knownContext: preparation.knownContext,
      requiredSignals: preparation.assetDiscovery.requiredSignals,
      assets: preparation.assetDiscovery.existing,
      missingSignals: preparation.missingSignals,
      recommendations: preparation.assetDiscovery.recommendations,
      opportunities: preparation.opportunities,
      risks: preparation.risks,
    },
    requiresApproval: true,
    readyForReview: preparation.sufficientToBegin,
  }
}

export function buildPreparationVoiceCommunication(input = {}) {
  const communication = resolvePreparationCommunication({
    ...input,
    modality: 'voice',
    assessment: { ...(input.assessment || {}), backgroundNoise: input.backgroundNoise || input.assessment?.backgroundNoise },
  })
  return {
    confidence: communication.confidence,
    shouldClarify: communication.objective === 'clarify' || communication.objective === 'confirm',
    message: communication.voice,
  }
}

export function resolvePreparationCommunication(input = {}) {
  const confidence = Number(input.speechConfidence)
  const level = confidence >= 0.8 ? 'high' : confidence >= 0.55 ? 'medium' : 'low'
  const transcript = clean(input.transcript || input.userText)
  const draft = input.briefingDraft || {}
  const assessment = input.assessment || {}

  let objective = 'acknowledge'
  let operationalAction = 'continue_listening'
  let behavior = 'brief_acknowledgement'
  let voice = 'Understood.'

  if (level === 'low' || assessment.backgroundNoise) {
    objective = 'clarify'
    operationalAction = 'restore_conversational_signal'
    behavior = 'brief_clarification'
    voice = assessment.backgroundNoise
      ? 'There was some background noise. Could you repeat that?'
      : 'I did not hear that clearly. Could you repeat it?'
  } else if (level === 'medium') {
    objective = 'confirm'
    operationalAction = 'confirm_understanding'
    behavior = 'natural_confirmation'
    voice = `I heard ${transcript || 'that detail'}. Is that right?`
  } else {
    const firstAsset = draft.assets?.[0]
    const missing = draft.missingSignals?.[0] || draft.requiredSignals?.find((signal) => !(draft.assets || []).some((asset) => signal.keywords?.some((keyword) => `${asset.title} ${asset.type}`.toLowerCase().includes(keyword))))

    if (assessment.repeatedKnownInformation) {
      objective = 'acknowledge'
      operationalAction = 'continue_briefing'
      behavior = 'minimal_acknowledgement'
      voice = 'Understood.'
    } else if (assessment.informationUnavailable) {
      objective = 'compensate'
      operationalAction = 'compensate_for_unavailable_information'
      behavior = 'confidence_building_reassurance'
      voice = "That's okay. We'll prepare around the information you do have and keep moving."
    } else if (firstAsset && (assessment.existingAsset || !missing)) {
      objective = 'recommend'
      operationalAction = 'use_existing_operational_asset'
      behavior = 'brief_recommendation'
      voice = `I found ${firstAsset.title} and recommend using it.`
    } else if (missing) {
      objective = 'request_missing_operational_signal'
      operationalAction = 'acquire_missing_operational_signal'
      behavior = 'value_before_request'
      voice = firstAsset
        ? `I found ${firstAsset.title}. The most important thing I'm still missing is ${String(missing).toLowerCase()}.`
        : `The most useful missing signal is ${String(missing).toLowerCase()}. If you have it available, a screenshot or photo is fine.`
    } else if (assessment.readyForReview) {
      objective = 'review_readiness'
      operationalAction = 'review_briefing_readiness'
      behavior = 'readiness_summary'
      voice = "I've assembled your briefing. Please review it."
    } else if (assessment.explainValue) {
      objective = 'explain_operational_value'
      operationalAction = 'explain_operational_value'
      behavior = 'natural_explanation'
      voice = 'That will help me tailor the preparation to this conversation.'
    }
  }

  return {
    confidence: level,
    operationalAction,
    objective,
    behavior,
    voice,
    visual: voice,
    shouldClarify: objective === 'clarify' || objective === 'confirm',
  }
}
