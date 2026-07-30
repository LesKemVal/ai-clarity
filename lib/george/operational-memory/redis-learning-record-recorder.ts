import 'server-only'

import { getRedis } from '@/lib/storage/redis'
import type { OperationalLearningRecordRecorder } from './learning-record-recorder'
import type {
  OperationalFormulaLineage,
  OperationalFormulaReassessment,
} from './types'

const REASSESSMENT_KEY_PREFIX =
  'george:operational-memory:reassessment:v1:'
const REASSESSMENT_CONVERSATION_INDEX_PREFIX =
  'george:operational-memory:conversation-reassessments:v1:'
const LINEAGE_KEY_PREFIX =
  'george:operational-memory:lineage:v1:'
const LINEAGE_CONVERSATION_INDEX_PREFIX =
  'george:operational-memory:conversation-lineages:v1:'

function reassessmentKey(id: string) {
  return `${REASSESSMENT_KEY_PREFIX}${encodeURIComponent(id)}`
}

function reassessmentConversationKey(conversationId: string) {
  return (
    REASSESSMENT_CONVERSATION_INDEX_PREFIX +
    encodeURIComponent(conversationId)
  )
}

function lineageKey(id: string) {
  return `${LINEAGE_KEY_PREFIX}${encodeURIComponent(id)}`
}

function lineageConversationKey(conversationId: string) {
  return (
    LINEAGE_CONVERSATION_INDEX_PREFIX +
    encodeURIComponent(conversationId)
  )
}

function parseReassessment(
  raw: string | null
): OperationalFormulaReassessment | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as OperationalFormulaReassessment
    return parsed?.id ? parsed : null
  } catch {
    return null
  }
}

function parseLineage(
  raw: string | null
): OperationalFormulaLineage | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as OperationalFormulaLineage
    return parsed?.id ? parsed : null
  } catch {
    return null
  }
}

export function createRedisOperationalLearningRecordRecorder():
OperationalLearningRecordRecorder {
  return {
    async saveReassessment(reassessment) {
      const redis = getRedis()

      await redis
        .multi()
        .set(
          reassessmentKey(reassessment.id),
          JSON.stringify(reassessment)
        )
        .sAdd(
          reassessmentConversationKey(reassessment.conversationId),
          reassessment.id
        )
        .exec()
    },

    async saveLineage(lineage) {
      const redis = getRedis()
      const transaction = redis
        .multi()
        .set(lineageKey(lineage.id), JSON.stringify(lineage))

      if (lineage.conversationId) {
        transaction.sAdd(
          lineageConversationKey(lineage.conversationId),
          lineage.id
        )
      }

      await transaction.exec()
    },

    async listReassessmentsByConversation(conversationId) {
      const redis = getRedis()
      const ids = await redis.sMembers(
        reassessmentConversationKey(conversationId)
      )

      const values = await Promise.all(
        ids.map((id) => redis.get(reassessmentKey(id)))
      )

      return values
        .map(parseReassessment)
        .filter(
          (
            reassessment
          ): reassessment is OperationalFormulaReassessment =>
            reassessment !== null
        )
        .sort((a, b) => b.assessedAt - a.assessedAt)
    },

    async listLineagesByConversation(conversationId) {
      const redis = getRedis()
      const ids = await redis.sMembers(
        lineageConversationKey(conversationId)
      )

      const values = await Promise.all(
        ids.map((id) => redis.get(lineageKey(id)))
      )

      return values
        .map(parseLineage)
        .filter(
          (lineage): lineage is OperationalFormulaLineage =>
            lineage !== null
        )
        .sort((a, b) => b.createdAt - a.createdAt)
    },
  }
}
