import {
  CONVERSATION_PACKAGE_EVENT,
  CONVERSATION_PACKAGE_STATUS,
} from './types.mjs'

function nowTimestamp(timestamp) {
  return timestamp || new Date().toISOString()
}

function normalizeList(value) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
}

function documentKey(item) {
  return typeof item === 'string' ? item : item.id || item.name || item.title
}

function uniqueByKey(items, getKey) {
  const seen = new Set()
  const result = []

  for (const item of items) {
    const key = getKey(item)
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }

  return result
}

function appendEvent(pkg, type, payload = {}, timestamp) {
  return {
    ...pkg,
    updatedAt: nowTimestamp(timestamp),
    events: [
      ...normalizeList(pkg.events),
      {
        type,
        at: nowTimestamp(timestamp),
        ...payload,
      },
    ],
  }
}

export function createConversationPackage(input = {}, options = {}) {
  const timestamp = nowTimestamp(options.timestamp)
  const id =
    input.id ||
    options.id ||
    `conversation-package-${timestamp.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`

  const pkg = {
    id,
    status: CONVERSATION_PACKAGE_STATUS.ACTIVE,
    desiredOutcome: input.desiredOutcome || '',
    conversationType: input.conversationType || '',
    conversationContext: input.conversationContext || '',
    role: input.role || '',
    conversationWith: input.conversationWith || '',
    relevantDocumentation: uniqueByKey(normalizeList(input.relevantDocumentation), documentKey),
    conversations: normalizeList(input.conversations),
    liveSummaries: normalizeList(input.liveSummaries),
    learning: normalizeList(input.learning),
    outcomeProgression: normalizeList(input.outcomeProgression),
    followUps: normalizeList(input.followUps),
    futureActions: normalizeList(input.futureActions),
    associatedProjects: normalizeList(input.associatedProjects),
    createdAt: timestamp,
    updatedAt: timestamp,
    events: [],
  }

  return appendEvent(
    pkg,
    CONVERSATION_PACKAGE_EVENT.CREATED,
    { desiredOutcome: pkg.desiredOutcome },
    timestamp
  )
}

export function updateConversationPackage(pkg, updates = {}, options = {}) {
  const next = {
    ...pkg,
    ...updates,
    relevantDocumentation:
      updates.relevantDocumentation === undefined
        ? uniqueByKey(normalizeList(pkg.relevantDocumentation), documentKey)
        : uniqueByKey(updates.relevantDocumentation, documentKey),
    conversations:
      updates.conversations === undefined
        ? normalizeList(pkg.conversations)
        : normalizeList(updates.conversations),
    liveSummaries:
      updates.liveSummaries === undefined
        ? normalizeList(pkg.liveSummaries)
        : normalizeList(updates.liveSummaries),
    learning:
      updates.learning === undefined
        ? normalizeList(pkg.learning)
        : normalizeList(updates.learning),
    outcomeProgression:
      updates.outcomeProgression === undefined
        ? normalizeList(pkg.outcomeProgression)
        : normalizeList(updates.outcomeProgression),
    followUps:
      updates.followUps === undefined
        ? normalizeList(pkg.followUps)
        : normalizeList(updates.followUps),
    futureActions:
      updates.futureActions === undefined
        ? normalizeList(pkg.futureActions)
        : normalizeList(updates.futureActions),
    associatedProjects:
      updates.associatedProjects === undefined
        ? normalizeList(pkg.associatedProjects)
        : normalizeList(updates.associatedProjects),
  }

  return appendEvent(
    next,
    CONVERSATION_PACKAGE_EVENT.UPDATED,
    { fields: Object.keys(updates) },
    options.timestamp
  )
}

export function attachDocumentation(pkg, documentation, options = {}) {
  const items = normalizeList(documentation)
  const relevantDocumentation = uniqueByKey(
    [...normalizeList(pkg.relevantDocumentation), ...items],
    documentKey
  )

  return appendEvent(
    {
      ...pkg,
      relevantDocumentation,
    },
    CONVERSATION_PACKAGE_EVENT.DOCUMENTATION_ATTACHED,
    { count: items.length },
    options.timestamp
  )
}

export function attachLiveSummary(pkg, summary, options = {}) {
  const items = normalizeList(summary)

  return appendEvent(
    {
      ...pkg,
      liveSummaries: [...normalizeList(pkg.liveSummaries), ...items],
    },
    CONVERSATION_PACKAGE_EVENT.LIVE_SUMMARY_ATTACHED,
    { count: items.length },
    options.timestamp
  )
}

export function attachLearning(pkg, learning, options = {}) {
  const items = normalizeList(learning)

  return appendEvent(
    {
      ...pkg,
      learning: [...normalizeList(pkg.learning), ...items],
    },
    CONVERSATION_PACKAGE_EVENT.LEARNING_ATTACHED,
    { count: items.length },
    options.timestamp
  )
}

export function trackOutcomeProgression(pkg, progression, options = {}) {
  const items = normalizeList(progression)

  return appendEvent(
    {
      ...pkg,
      outcomeProgression: [...normalizeList(pkg.outcomeProgression), ...items],
    },
    CONVERSATION_PACKAGE_EVENT.OUTCOME_PROGRESS_RECORDED,
    { count: items.length },
    options.timestamp
  )
}

export function completeConversationPackage(pkg, completion = {}, options = {}) {
  return appendEvent(
    {
      ...pkg,
      status: CONVERSATION_PACKAGE_STATUS.COMPLETED,
      completion,
    },
    CONVERSATION_PACKAGE_EVENT.COMPLETED,
    { completion },
    options.timestamp
  )
}

export function mergeConversationPackages(primary, related = [], options = {}) {
  const relatedPackages = normalizeList(related)
  const mergedPackageIds = relatedPackages.map((pkg) => pkg.id).filter(Boolean)

  const merged = relatedPackages.reduce((current, pkg) => ({
    ...current,
    relevantDocumentation: uniqueByKey(
      [
        ...normalizeList(current.relevantDocumentation),
        ...normalizeList(pkg.relevantDocumentation),
      ],
      documentKey
    ),
    conversations: [...normalizeList(current.conversations), ...normalizeList(pkg.conversations)],
    liveSummaries: [...normalizeList(current.liveSummaries), ...normalizeList(pkg.liveSummaries)],
    learning: [...normalizeList(current.learning), ...normalizeList(pkg.learning)],
    outcomeProgression: [
      ...normalizeList(current.outcomeProgression),
      ...normalizeList(pkg.outcomeProgression),
    ],
    followUps: [...normalizeList(current.followUps), ...normalizeList(pkg.followUps)],
    futureActions: [...normalizeList(current.futureActions), ...normalizeList(pkg.futureActions)],
    associatedProjects: [
      ...normalizeList(current.associatedProjects),
      ...normalizeList(pkg.associatedProjects),
    ],
  }), primary)

  return appendEvent(
    {
      ...merged,
      mergedPackageIds: uniqueByKey(
        [...normalizeList(primary.mergedPackageIds), ...mergedPackageIds],
        (id) => id
      ),
    },
    CONVERSATION_PACKAGE_EVENT.MERGED,
    { mergedPackageIds },
    options.timestamp
  )
}
