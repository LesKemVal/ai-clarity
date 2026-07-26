import 'server-only'

import { getRedis } from '@/lib/storage/redis'
import type { OperationalScriptLibrary } from './script-library'
import type { OperationalScript } from './types'

const SCRIPT_INDEX_KEY = 'george:operational-memory:script-ids:v1'
const SCRIPT_KEY_PREFIX = 'george:operational-memory:script:v1:'

function scriptKey(id: string) {
  return `${SCRIPT_KEY_PREFIX}${encodeURIComponent(id)}`
}

function normalizeRequired(value: unknown, label: string) {
  const normalized = String(value ?? '').trim()

  if (!normalized) {
    throw new Error(`Operational script requires ${label}`)
  }

  return normalized
}

function parseScript(raw: string | null): OperationalScript | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as OperationalScript

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.id !== 'string' ||
      !parsed.id.trim() ||
      typeof parsed.ownerId !== 'string' ||
      !parsed.ownerId.trim() ||
      typeof parsed.createdAt !== 'number' ||
      typeof parsed.updatedAt !== 'number'
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

async function loadAllScripts(): Promise<OperationalScript[]> {
  const redis = getRedis()
  const ids = await redis.sMembers(SCRIPT_INDEX_KEY)

  if (ids.length === 0) return []

  const values = await Promise.all(
    ids.map((id) => redis.get(scriptKey(id)))
  )

  return values
    .map(parseScript)
    .filter((script): script is OperationalScript => script !== null)
}

export function createRedisOperationalScriptLibrary(): OperationalScriptLibrary {
  return {
    async getById(id: string) {
      const normalizedId = String(id ?? '').trim()
      if (!normalizedId) return null

      const redis = getRedis()
      return parseScript(await redis.get(scriptKey(normalizedId)))
    },

    async save(script: OperationalScript) {
      const normalizedId = normalizeRequired(script.id, 'an id')
      normalizeRequired(script.ownerId, 'an owner id')

      const redis = getRedis()

      await redis
        .multi()
        .set(scriptKey(normalizedId), JSON.stringify(script))
        .sAdd(SCRIPT_INDEX_KEY, normalizedId)
        .exec()
    },

    async delete(id: string, ownerId: string) {
      const normalizedId = normalizeRequired(id, 'an id')
      const normalizedOwnerId = normalizeRequired(ownerId, 'an owner id')

      const redis = getRedis()
      const existing = parseScript(
        await redis.get(scriptKey(normalizedId))
      )

      if (!existing) return

      if (existing.ownerId !== normalizedOwnerId) {
        throw new Error(
          'Operational script cannot be deleted by a different owner'
        )
      }

      await redis
        .multi()
        .del(scriptKey(normalizedId))
        .sRem(SCRIPT_INDEX_KEY, normalizedId)
        .exec()
    },

    async listByOwner(ownerId: string) {
      const normalizedOwnerId = String(ownerId ?? '').trim()
      if (!normalizedOwnerId) return []

      const scripts = await loadAllScripts()

      return scripts
        .filter((script) => script.ownerId === normalizedOwnerId)
        .sort((left, right) => right.updatedAt - left.updatedAt)
    },
  }
}
