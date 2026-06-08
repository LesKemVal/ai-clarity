'use client'

import { useEffect, useMemo, useState } from 'react'
import PageShell from '@/components/layout/PageShell'
import { fetchGeorgeSessionAuthority, readCachedGeorgeSessionAuthority } from '@/lib/george/session-authority'

type SessionResponse = {
  authenticated?: boolean
  tier?: 'smart' | 'intelligent' | 'brilliant'
  liveAccess?: boolean
  email?: string | null
}

type RuntimeRecord = {
  id?: string
  createdAt?: number
  durationMinutes?: number
  estimatedCents?: number | null
  actualCents?: number | null
  summary?: string
  composition?: string[]
  setup?: {
    room?: string
    language?: string
    liveAssistMode?: 'cues' | 'lines'
  } | null
}

function formatDate(value?: number) {
  if (!value) return 'Recent'

  const date = new Date(value)
  const today = new Date()
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()

  if (sameDay) return 'Today'

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function normalizeRoom(record: RuntimeRecord) {
  return record.setup?.room || 'LIVE Room'
}

function normalizeComposition(record: RuntimeRecord) {
  const parts = Array.isArray(record.composition)
    ? record.composition
    : String(record.summary || '')
        .split('·')
        .map((item) => item.trim())
        .filter(Boolean)

  if (parts.length > 0) return parts.join(' · ')

  return 'LIVE minutes · speech processing · adaptive reasoning · response shaping · continuity active'
}

function formatCost(value?: number | null) {
  return typeof value === 'number' ? `${value}¢` : '—'
}

function getProjectedUse(records: RuntimeRecord[]) {
  const recent = records.slice(0, 5)
  const totalActual = recent.reduce((sum, record) => sum + (record.actualCents || 0), 0)
  const totalMinutes = recent.reduce((sum, record) => sum + (record.durationMinutes || 0), 0)
  const adaptiveSignals = recent.filter((record) =>
    normalizeComposition(record).toLowerCase().includes('pressure') ||
    normalizeComposition(record).toLowerCase().includes('negotiation') ||
    normalizeComposition(record).toLowerCase().includes('multilingual')
  ).length

  if (recent.length === 0) {
    return {
      level: 'No LIVE runtime history yet',
      tier: 'Intelligent',
      reason: 'Start with Intelligent until LIVE becomes frequent or pressure-heavy.',
      nextMonth: 'Unknown until GEORGE records a few LIVE rooms.',
    }
  }

  const projectedMonthlyCents = Math.round((totalActual / Math.max(1, recent.length)) * 8)
  const projectedMonthlyMinutes = Math.round((totalMinutes / Math.max(1, recent.length)) * 8)

  if (projectedMonthlyCents >= 120 || projectedMonthlyMinutes >= 180 || adaptiveSignals >= 2) {
    return {
      level: 'Moderate–high adaptive LIVE usage',
      tier: 'Brilliant',
      reason: 'Best fit when LIVE support is recurring, pressure-heavy, or adaptive.',
      nextMonth: `${projectedMonthlyMinutes || '—'} projected LIVE minutes · adaptive runtime likely`,
    }
  }

  if (projectedMonthlyCents >= 45 || projectedMonthlyMinutes >= 60) {
    return {
      level: 'Low–moderate LIVE usage',
      tier: 'Intelligent',
      reason: 'Best fit while LIVE support is useful but not yet a regular operating layer.',
      nextMonth: `${projectedMonthlyMinutes || '—'} projected LIVE minutes · standard runtime likely`,
    }
  }

  return {
    level: 'Light LIVE usage',
    tier: 'Intelligent',
    reason: 'Best fit for occasional rooms and continuity-backed runtime support.',
    nextMonth: `${projectedMonthlyMinutes || '—'} projected LIVE minutes · light runtime likely`,
  }
}

export default function RuntimePage() {
  const [session, setSession] = useState<SessionResponse | null>(null)
  const [records, setRecords] = useState<RuntimeRecord[]>([])
  const [localEmail, setLocalEmail] = useState('')

  useEffect(() => {
    let cancelled = false

    fetchGeorgeSessionAuthority()
      .then((authority) => {
        if (!cancelled) {
          setSession(authority)
          setLocalEmail(authority.email)
        }
      })
      .catch(() => {
        if (!cancelled) setSession({ authenticated: false, tier: 'smart', liveAccess: false })
      })

    fetch('/api/runtime-usage', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data?.records) && data.records.length > 0) {
          setRecords(data.records)
        }
      })
      .catch(() => {})

    try {
      const authority = readCachedGeorgeSessionAuthority()
      const raw = window.localStorage.getItem('GEORGE_LIVE_SESSION_METRICS') || '[]'
      const parsed = JSON.parse(raw)

      setLocalEmail(authority.email)
      setRecords(Array.isArray(parsed) ? parsed : [])

      if (authority.authenticated) {
        setSession((current) => current?.authenticated ? current : authority)
      }
    } catch {
      setRecords([])
    }

    return () => {
      cancelled = true
    }
  }, [])

  const projection = useMemo(() => getProjectedUse(records), [records])
  const authenticated = Boolean(session?.authenticated || localEmail)
  const visibleRecords = records.slice(0, 6)

  return (
    <PageShell backToGeorge withSidebar={false} eyebrow="GEORGE" title="Operational Record">
      <section className="rounded-[1.1rem] border border-white/[0.045] bg-white/[0.010] p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#C9D0FF]/42">
              LIVE Operational Record
            </p>
            <p className="text-sm leading-7 text-white/52">
              Review recent LIVE rooms, continuity state, and the operating support GEORGE used during active conversations.
            </p>
          </div>

          <div className="rounded-[0.9rem] border border-white/[0.04] bg-black/24 px-4 py-3 text-right">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/30">
              Continuity
            </div>
            <div className="mt-1 text-sm text-white/70">
              {authenticated ? 'Restored' : 'Not restored'}
            </div>

            {(session?.email || localEmail) && (
              <button
                type="button"
                onClick={async () => {
                  window.localStorage.removeItem('george_email')
                  window.localStorage.removeItem('george_verified_continuity')
                  window.localStorage.removeItem('george_tier')
                  await fetch('/api/logout', { method: 'POST' }).catch(() => {})
                  window.location.reload()
                }}
                className="mt-3 rounded-full border border-white/[0.07] bg-white/[0.018] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38 transition hover:border-white/[0.14] hover:bg-white/[0.045] hover:text-white/70"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </section>

      {!authenticated && (
        <section className="rounded-[1rem] border border-[#AAB4FF]/12 bg-[#AAB4FF]/[0.035] p-5">
          <p className="text-sm font-medium text-[#D7DCFF]">Login to view LIVE Operational Record.</p>
          <p className="mt-2 text-sm leading-6 text-white/45">
            LIVE records are tied to recognized GEORGE continuity on this device.
          </p>
          <button
            type="button"
            onClick={() => (window.location.href = '/activate')}
            className="mt-4 rounded-[0.8rem] border border-white/[0.08] bg-white/[0.024] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/64 transition hover:bg-white/[0.045] hover:text-white/84"
          >
            Login
          </button>
        </section>
      )}

      <section className="rounded-[1rem] border border-white/[0.045] bg-white/[0.008] p-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/32">
          Recommended support based on recent LIVE use
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-[0.9rem] border border-white/[0.04] bg-black/20 p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/28">Use pattern</div>
            <div className="mt-2 text-sm text-white/72">{projection.level}</div>
          </div>
          <div className="rounded-[0.9rem] border border-white/[0.04] bg-black/20 p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/28">Likely fit</div>
            <div className="mt-2 text-sm text-white/72">{projection.tier}</div>
          </div>
          <div className="rounded-[0.9rem] border border-white/[0.04] bg-black/20 p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/28">Next month</div>
            <div className="mt-2 text-sm text-white/72">{projection.nextMonth}</div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/42">{projection.reason}</p>
      </section>

      <section className="rounded-[1rem] border border-white/[0.045] bg-white/[0.008] p-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/32">
          Recent LIVE records
        </p>

        <div className="mt-4 space-y-3">
          {visibleRecords.length === 0 ? (
            <div className="rounded-[0.9rem] border border-white/[0.035] bg-black/20 p-4 text-sm leading-6 text-white/42">
              No LIVE records yet. Start LIVE from GEORGE to begin recording room activity.
            </div>
          ) : (
            visibleRecords.map((record, index) => (
              <div
                key={record.id || `${record.createdAt || index}`}
                className="rounded-[0.9rem] border border-white/[0.04] bg-black/22 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-white/76">{normalizeRoom(record)}</div>
                    <div className="mt-1 text-xs text-white/34">{formatDate(record.createdAt)}</div>
                  </div>
                  <div className="text-right text-sm text-white/62">
                    {formatCost(record.actualCents ?? record.estimatedCents)}
                  </div>
                </div>
                <div className="mt-3 text-xs leading-5 text-white/42">
                  {normalizeComposition(record)}
                </div>
                {record.durationMinutes && (
                  <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/24">
                    {record.durationMinutes} LIVE minutes
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </PageShell>
  )
}
