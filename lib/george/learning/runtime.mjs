function clean(value) {
  return String(value || '').trim()
}

function normalizeList(value) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
}

function words(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2)
}

function overlapScore(a, b) {
  const left = new Set(words(a))
  const right = new Set(words(b))
  if (!left.size || !right.size) return 0

  let overlap = 0
  for (const word of left) {
    if (right.has(word)) overlap += 1
  }

  return overlap / Math.max(left.size, right.size)
}

function classifyEvidence(candidate = {}) {
  const text = `${candidate.type || ''} ${candidate.evidence || ''}`.toLowerCase()

  if (
    candidate.type === 'person' ||
    text.includes('person') ||
    text.includes('investor') ||
    text.includes('doctor') ||
    text.includes('partner') ||
    text.includes('recruiter')
  ) {
    return 'person'
  }

  if (
    candidate.type === 'communication_pattern' ||
    text.includes('prefers') ||
    text.includes('responds better') ||
    text.includes('benefits from') ||
    text.includes('pause') ||
    text.includes('concise') ||
    text.includes('examples')
  ) {
    return 'communication_pattern'
  }

  if (candidate.type === 'documentation' || text.includes('document') || text.includes('metrics') || text.includes('deck')) {
    return 'documentation'
  }

  if (candidate.type === 'follow_up' || text.includes('follow up') || text.includes('next meeting')) {
    return 'follow_up'
  }

  if (candidate.type === 'outcome') {
    return 'outcome_evidence'
  }

  return 'conversation_evidence'
}

function outcomeRelevance(candidate = {}, context = {}) {
  const outcome = clean(context.desiredOutcome)
  const related = normalizeList(context.relatedOutcomes).join(' ')
  const packageText = [
    outcome,
    related,
    context.conversationContext,
    context.conversationWith,
  ].filter(Boolean).join(' ')

  const evidence = clean(candidate.evidence)
  const explicit = candidate.outcomeRelevant === true || candidate.futureUseful === true
  const score = Math.max(
    explicit ? 0.82 : 0,
    overlapScore(evidence, packageText)
  )

  return Number(score.toFixed(3))
}

function learningDecision(candidate = {}, relevanceScore, confidence) {
  if (candidate.userOverride === 'reject') return 'rejected_by_user'
  if (candidate.userOverride === 'promote') return 'promote'
  if (relevanceScore < 0.24) return 'discard_not_outcome_relevant'
  if (confidence >= 0.72) return 'promote'
  if (confidence >= 0.5) return 'hold_for_more_evidence'
  return 'evidence_candidate'
}

export function evaluateLearningCandidates(input = {}, options = {}) {
  const context = {
    desiredOutcome:
      clean(input.desiredOutcome) ||
      clean(input.conversationPackage?.desiredOutcome) ||
      '',
    relatedOutcomes: input.relatedOutcomes || input.conversationPackage?.relatedOutcomes || [],
    conversationContext:
      clean(input.conversationContext) ||
      clean(input.conversationPackage?.conversationContext) ||
      '',
    conversationWith:
      clean(input.conversationWith) ||
      clean(input.conversationPackage?.conversationWith) ||
      '',
  }

  const candidates = normalizeList(
    input.evidenceCandidates ||
      input.summary?.evidenceCandidates ||
      input.conversationSummary?.evidenceCandidates
  )

  return candidates.map((candidate, index) => {
    const relevanceScore = outcomeRelevance(candidate, context)
    const baseConfidence = Number(candidate.confidence || 0.42)
    const confidence = Number(Math.min(1, Math.max(baseConfidence, relevanceScore * 0.82)).toFixed(3))

    return {
      id: candidate.id || `learning-candidate-${index + 1}`,
      type: classifyEvidence(candidate),
      evidence: clean(candidate.evidence),
      outcomeRelevant: relevanceScore >= 0.24 || candidate.outcomeRelevant === true || candidate.futureUseful === true,
      outcomeRelevance: relevanceScore,
      confidence,
      decision: learningDecision(candidate, relevanceScore, confidence),
      source: candidate.type || 'evidence_candidate',
      createdAt: options.timestamp || new Date().toISOString(),
    }
  }).filter((candidate) => candidate.evidence)
}

export function promoteLearningCandidates(candidates = []) {
  return normalizeList(candidates).filter((candidate) => candidate.decision === 'promote')
}

export function holdLearningCandidates(candidates = []) {
  return normalizeList(candidates).filter((candidate) => candidate.decision === 'hold_for_more_evidence')
}

export function discardLearningCandidates(candidates = []) {
  return normalizeList(candidates).filter((candidate) => candidate.decision === 'discard_not_outcome_relevant')
}
