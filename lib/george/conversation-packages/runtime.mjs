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

  if (liveResult.outcomeProgression) {
    next = trackOutcomeProgression(next, liveResult.outcomeProgression, options)
  }

  if (liveResult.learning) {
    next = attachLearning(next, liveResult.learning, options)
  }

  return next
}

export function attachSummary(pkg, summary, options = {}) {
  return attachLiveSummary(pkg, summary, options)
}

export {
  attachLearning,
  attachDocumentation,
}
