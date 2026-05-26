import type { LiveRuntimeUsageRecord } from '@/lib/george/live-runtime/prep-runtime'
import { getRedis } from '@/lib/storage/redis'

type RuntimeUsageStore = {
  users: Record<string, LiveRuntimeUsageRecord[]>
}

const RUNTIME_USAGE_PREFIX = 'george:runtime-usage:'

function normalizeEmail(email: unknown) {
  return String(email || '').trim().toLowerCase()
}

function runtimeUsageKey(email: string) {
  return `${RUNTIME_USAGE_PREFIX}${email}`
}

function parseRecords(raw: unknown): LiveRuntimeUsageRecord[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(String(raw))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function getRuntimeUsageRecords(email: unknown) {
  const cleanEmail = normalizeEmail(email)
  if (!cleanEmail) return []

  const redis = getRedis()
  const raw = await redis.get(runtimeUsageKey(cleanEmail))

  return parseRecords(raw)
}

export async function appendRuntimeUsageRecord(email: unknown, record: LiveRuntimeUsageRecord) {
  const cleanEmail = normalizeEmail(email)
  if (!cleanEmail) return null

  const redis = getRedis()
  const existing = parseRecords(await redis.get(runtimeUsageKey(cleanEmail)))
  const deduped = existing.filter((item) => item.id !== record.id)
  const next = [record, ...deduped].slice(0, 100)

  await redis.set(runtimeUsageKey(cleanEmail), JSON.stringify(next))

  return record
}

export function normalizeRuntimeUsageStore(store: RuntimeUsageStore): RuntimeUsageStore {
  return {
    users: store?.users || {},
  }
}