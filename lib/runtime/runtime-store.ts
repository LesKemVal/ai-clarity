import fs from 'fs'
import path from 'path'
import type { LiveRuntimeUsageRecord } from '@/lib/george/live-runtime/prep-runtime'

type RuntimeUsageStore = {
  users: Record<string, LiveRuntimeUsageRecord[]>
}

const storePath = path.join(process.cwd(), 'data', 'runtime-usage.json')

function normalizeEmail(email: unknown) {
  return String(email || '').trim().toLowerCase()
}

function defaultStore(): RuntimeUsageStore {
  return { users: {} }
}

function readStore(): RuntimeUsageStore {
  try {
    const parsed = JSON.parse(fs.readFileSync(storePath, 'utf8'))
    return { users: parsed?.users || {} }
  } catch {
    return defaultStore()
  }
}

function writeStore(store: RuntimeUsageStore) {
  fs.mkdirSync(path.dirname(storePath), { recursive: true })
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2))
}

export function getRuntimeUsageRecords(email: unknown) {
  const cleanEmail = normalizeEmail(email)
  if (!cleanEmail) return []

  const store = readStore()
  const records = store.users[cleanEmail]

  return Array.isArray(records) ? records : []
}

export function appendRuntimeUsageRecord(email: unknown, record: LiveRuntimeUsageRecord) {
  const cleanEmail = normalizeEmail(email)
  if (!cleanEmail) return null

  const store = readStore()
  const existing = Array.isArray(store.users[cleanEmail]) ? store.users[cleanEmail] : []

  const deduped = existing.filter((item) => item.id !== record.id)
  const next = [record, ...deduped].slice(0, 100)

  store.users[cleanEmail] = next
  writeStore(store)

  return record
}
