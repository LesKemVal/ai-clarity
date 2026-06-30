import {
  attachDocumentation,
  createConversationPackage,
  updateConversationPackage,
} from './manager.mjs'

function clean(value) {
  return String(value || '').trim()
}

function normalizeResources(resources = []) {
  if (!Array.isArray(resources)) return []

  return resources
    .map((resource) => {
      if (typeof resource === 'string') return resource.trim()

      const title =
        clean(resource.title) ||
        clean(resource.name) ||
        clean(resource.filename) ||
        clean(resource.label)

      if (!title) return null

      return {
        id: clean(resource.id) || title,
        title,
        type: clean(resource.type) || clean(resource.mimeType) || 'document',
      }
    })
    .filter(Boolean)
}

export function buildConversationPackageFromLiveEntry(setup = {}, options = {}) {
  const resources = normalizeResources(
    setup.resources ||
      setup.relevantDocumentation ||
      setup.documentation ||
      options.resources
  )

  const pkg = createConversationPackage(
    {
      id: setup.conversationPackageId || options.id,
      desiredOutcome: clean(setup.objective) || clean(setup.desiredOutcome),
      conversationType: clean(setup.conversationType) || clean(setup.room),
      conversationContext:
        clean(setup.knownContext) ||
        clean(setup.conversationContext) ||
        clean(setup.additionalContext),
      role: clean(setup.role) || clean(setup.responsibility),
      conversationWith: clean(setup.conversationWith) || clean(setup.chair),
      relevantDocumentation: [],
      conversations: [
        {
          id: setup.sessionId || options.conversationId || 'live-entry-conversation',
          source: 'live-entry',
          desiredOutcome: clean(setup.objective) || clean(setup.desiredOutcome),
          at: options.timestamp,
        },
      ],
    },
    options
  )

  const withDocumentation = resources.length
    ? attachDocumentation(pkg, resources, options)
    : pkg

  return updateConversationPackage(
    withDocumentation,
    {
      supportStyle: clean(setup.supportStyle) || clean(setup.deliveryStyle),
      steeringPhrases: Array.isArray(setup.steeringPhrases)
        ? setup.steeringPhrases.filter(Boolean)
        : [],
    },
    options
  )
}
