import {
  identifyConversationPackage,
  createConversationPackage,
  updateConversationPackage,
  attachDocumentation,
  attachLiveSummary,
  attachLearning,
  trackOutcomeProgression,
} from './index.mjs'
import { buildConversationPackageFromLiveEntry } from './live-entry-package.mjs'

function normalizeList(value) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
}

function packageInputFromSetup(setup = {}) {
  return {
    desiredOutcome: setup.desiredOutcome || setup.objective || '',
    conversationType: setup.conversationType || setup.room || '',
    conversationContext:
      setup.conversationContext ||
      setup.knownContext ||
      setup.additionalContext ||
      '',
    relevantDocumentation:
      setup.relevantDocumentation ||
      setup.resources ||
      setup.documentation ||
      [],
  }
}

function latest(items = []) {
  const list = normalizeList(items)
  return list[list.length - 1] || null
}

function outcomeProgressionFromReview(review = {}) {
  if (!review || typeof review !== 'object') return []

  return [{
    source: 'outcome_review',
    desiredOutcome: review.desiredOutcome || review.desiredState || '',
    observedProgress: review.observedProgress || 'unknown',
    confidence: typeof review.confidence === 'number' ? review.confidence : 0,
    currentState: review.currentState || '',
    observedChange: review.observedChange || review.notes || '',
    availablePaths: normalizeList(review.availablePaths),
    bestAvailablePath: review.bestAvailablePath || '',
    possibleSecondaryOutcome: review.possibleSecondaryOutcome || '',
  }]
}

function learningFromOutcomeReview(review = {}) {
  if (!review || typeof review !== 'object') return []

  const bestAvailablePath = String(review.bestAvailablePath || '').trim()
  const assistanceOptions = normalizeList(review.assistanceOptions)
  const internalNotes = String(review.internalNotes || review.notes || '').trim()

  if (!bestAvailablePath && assistanceOptions.length === 0 && !internalNotes) return []

  return [{
    source: 'outcome_review',
    evidence: internalNotes,
    confidence: typeof review.confidence === 'number' ? review.confidence : 0,
    learning: bestAvailablePath ? `We can ${bestAvailablePath.charAt(0).toLowerCase()}${bestAvailablePath.slice(1)}` : '',
    futureConversations: assistanceOptions,
  }]
}

function opportunityContinuityFromLiveResult(liveResult = {}) {
  const opportunityContinuity = liveResult.opportunityContinuity

  if (!opportunityContinuity || typeof opportunityContinuity !== 'object') return null

  return {
    source: 'opportunity_continuity',
    doctrine: opportunityContinuity.doctrine || 'Live to fight another day.',
    opportunityState: opportunityContinuity.opportunityState || 'unknown',
    executionDecision: opportunityContinuity.executionDecision || 'gather_missing_evidence',
    confidence: typeof opportunityContinuity.confidence === 'number' ? opportunityContinuity.confidence : 0,
    opportunitySurvived: Boolean(opportunityContinuity.opportunitySurvived),
    desiredOutcomeStillAchievable: Boolean(opportunityContinuity.desiredOutcomeStillAchievable),
    nextExecutableOpportunity: opportunityContinuity.nextExecutableOpportunity || '',
    timing: opportunityContinuity.timing || 'wait',
    preservedLeverage: normalizeList(opportunityContinuity.preservedLeverage),
    evidenceStillRequired: normalizeList(opportunityContinuity.evidenceStillRequired),
    decisionMakerKnowledge: opportunityContinuity.decisionMakerKnowledge || '',
    objectiveEvolution: opportunityContinuity.objectiveEvolution || '',
    preparationCarryForward: opportunityContinuity.preparationCarryForward || null,
  }
}

function learningFromOpportunityContinuity(opportunityContinuity = {}) {
  if (!opportunityContinuity || typeof opportunityContinuity !== 'object') return []

  const nextExecutableOpportunity = String(opportunityContinuity.nextExecutableOpportunity || '').trim()
  const evidenceStillRequired = normalizeList(opportunityContinuity.evidenceStillRequired)

  if (!nextExecutableOpportunity && evidenceStillRequired.length === 0) return []

  return [{
    source: 'opportunity_continuity',
    evidence: [
      opportunityContinuity.reasoning || '',
      ...normalizeList(opportunityContinuity.preservedLeverage),
      ...evidenceStillRequired,
    ].filter(Boolean).join(' '),
    confidence: typeof opportunityContinuity.confidence === 'number' ? opportunityContinuity.confidence : 0,
    learning: nextExecutableOpportunity ? `We can ${nextExecutableOpportunity.charAt(0).toLowerCase()}${nextExecutableOpportunity.slice(1)}` : '',
    futureConversations: [
      nextExecutableOpportunity,
      ...evidenceStillRequired,
    ].filter(Boolean),
  }]
}

function nextActionsFromLiveResult(liveResult = {}) {
  const summary = liveResult.summary || liveResult.conversationSummary || {}
  const opportunityContinuity = liveResult.opportunityContinuity || {}
  const action =
    liveResult.nextSuggestedAction ||
    liveResult.suggestedNextAction ||
    summary.suggestedNextAction ||
    summary.nextSuggestedAction ||
    opportunityContinuity.nextExecutableOpportunity ||
    ''

  return normalizeList(action).map((item) => typeof item === 'string' ? item.trim() : item).filter(Boolean)
}

export function resolveConversationPackage(input = {}, candidates = [], options = {}) {
  const setup = input.setup || input
  const identification = identifyConversationPackage(
    packageInputFromSetup(setup),
    candidates
  )

  if (identification.decision === 'continue_existing_conversation_package') {
    const candidate = identification.candidate
    const updated = updateConversationPackage(
      candidate,
      {
        desiredOutcome: candidate.desiredOutcome || setup.desiredOutcome || setup.objective || '',
        conversationType: candidate.conversationType || setup.conversationType || setup.room || '',
        conversationContext:
          candidate.conversationContext ||
          setup.conversationContext ||
          setup.knownContext ||
          setup.additionalContext ||
          '',
      },
      options
    )

    const documentation =
      setup.relevantDocumentation ||
      setup.resources ||
      setup.documentation ||
      []

    return {
      decision: identification.decision,
      score: identification.score,
      package: normalizeList(documentation).length
        ? attachDocumentation(updated, documentation, options)
        : updated,
      candidate,
    }
  }

  if (identification.decision === 'ask_user_to_confirm_related_conversation') {
    return {
      decision: identification.decision,
      score: identification.score,
      package: null,
      candidate: identification.candidate,
    }
  }

  return {
    decision: identification.decision,
    score: identification.score,
    package: buildConversationPackageFromLiveEntry(setup, options),
    candidate: identification.candidate,
  }
}

export function prepareConversation(input = {}, candidates = [], options = {}) {
  return resolveConversationPackage(input, candidates, options)
}

export function continueConversation(pkg, updates = {}, options = {}) {
  return updateConversationPackage(
    pkg,
    {
      ...updates,
      conversations: [
        ...normalizeList(pkg.conversations),
        ...normalizeList(updates.conversations),
      ],
    },
    options
  )
}

export function updateAfterLive(pkg, liveResult = {}, options = {}) {
  let next = pkg

  if (liveResult.summary) {
    next = attachLiveSummary(next, liveResult.summary, options)
  }

  const outcomeProgression = [
    ...normalizeList(liveResult.outcomeProgression),
    ...outcomeProgressionFromReview(liveResult.outcomeReview),
  ]

  if (outcomeProgression.length > 0) {
    next = trackOutcomeProgression(next, outcomeProgression, options)
  }

  const opportunityContinuity = opportunityContinuityFromLiveResult(liveResult)

  if (opportunityContinuity) {
    next = updateConversationPackage(
      next,
      {
        opportunityContinuity: [
          ...normalizeList(next.opportunityContinuity),
          opportunityContinuity,
        ],
      },
      options
    )
  }

  const learning = [
    ...normalizeList(liveResult.learning),
    ...learningFromOutcomeReview(liveResult.outcomeReview),
    ...learningFromOpportunityContinuity(liveResult.opportunityContinuity),
  ]

  if (learning.length > 0) {
    next = attachLearning(next, learning, options)
  }

  const futureActions = nextActionsFromLiveResult(liveResult)

  if (futureActions.length > 0) {
    next = updateConversationPackage(
      next,
      {
        futureActions: [
          ...normalizeList(next.futureActions),
          ...futureActions,
        ],
      },
      options
    )
  }

  return next
}

export function buildConversationRecord(pkg = {}, options = {}) {
  const outcome = latest(pkg.outcomeProgression)
  const summary = latest(pkg.liveSummaries)
  const learning = latest(pkg.learning)
  const opportunityContinuity = latest(pkg.opportunityContinuity)

  return {
    id: options.id || `conversation-record-${pkg.id || 'unpackaged'}`,
    source: 'conversation-package-runtime',
    packageId: pkg.id || '',
    desiredOutcome: pkg.desiredOutcome || outcome?.desiredOutcome || '',
    conversationType: pkg.conversationType || '',
    conversationContext: pkg.conversationContext || '',
    summary: typeof summary === 'string' ? summary : summary?.summary || summary?.text || '',
    outcomeProgression: normalizeList(pkg.outcomeProgression),
    latestOutcome: outcome,
    opportunityContinuity: normalizeList(pkg.opportunityContinuity),
    latestOpportunityContinuity: opportunityContinuity,
    learning: normalizeList(pkg.learning),
    latestLearning: learning,
    futureActions: normalizeList(pkg.futureActions),
    relevantDocumentation: normalizeList(pkg.relevantDocumentation),
    transcriptEvidenceAvailable: normalizeList(pkg.conversations).length > 0,
    createdAt: options.timestamp || new Date().toISOString(),
  }
}

export function attachSummary(pkg, summary, options = {}) {
  return attachLiveSummary(pkg, summary, options)
}

export {
  attachLearning,
  attachDocumentation,
}
