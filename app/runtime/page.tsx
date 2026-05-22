'use client'

import { useEffect, useMemo, useState } from 'react'
import PageShell from '@/components/layout/PageShell'

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

  return 'LIVE runtime minutes · speech processing · adaptive reasoning · response shaping · continuity active'
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

    fetch('/api/session', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setSession(data)
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
      const email = window.localStorage.getItem('george_email') || ''
      const verified = window.localStorage.getItem('george_verified_continuity') === 'true'
      const tier = window.localStorage.getItem('george_tier') || 'smart'
      const raw = window.localStorage.getItem('GEORGE_LIVE_SESSION_METRICS') || '[]'
      const parsed = JSON.parse(raw)

      setLocalEmail(email)
      setRecords(Array.isArray(parsed) ? parsed : [])

      if (verified && email) {
        setSession((current) =>
          current?.authenticated
            ? current
            : {
                authenticated: true,
                tier: tier === 'brilliant' ? 'brilliant' : tier === 'intelligent' ? 'intelligent' : 'smart',
                liveAccess: tier === 'brilliant' || tier === 'intelligent',
                email,
              }
        )
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
    <PageShell backToGeorge withSidebar={false} eyebrow="LIVE Bx" title="Prescriptions">
      <section className="rounded-[1.1rem] border border-white/[0.045] bg-white/[0.010] p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#C9D0FF]/42">
              LIVE Bx Prescriptions
            </p>
            <p className="text-sm leading-7 text-white/52">
              Runtime receipts for LIVE rooms. Costs stay quantified; resources read like ingredients.
            </p>
          </div>

          <div className="rounded-[0.9rem] border border-white/[0.04] bg-black/24 px-4 py-3 text-right">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/30">
              Logged in
            </div>
            <div className="mt-1 text-sm text-white/70">
              {session?.email || localEmail || 'Not restored'}
            </div>
          </div>
        </div>
      </section>

      {!authenticated && (
        <section className="rounded-[1rem] border border-[#AAB4FF]/12 bg-[#AAB4FF]/[0.035] p-5">
          <p className="text-sm font-medium text-[#D7DCFF]">Login to view LIVE Bx Prescriptions.</p>
          <p className="mt-2 text-sm leading-6 text-white/45">
            Runtime receipts are tied to recognized GEORGE continuity on this device.
          </p>
          <button
            type="button"
            onClick={() => (window.location.href = '/top-up')}
            className="mt-4 rounded-[0.8rem] border border-white/[0.08] bg-white/[0.024] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/64 transition hover:bg-white/[0.045] hover:text-white/84"
          >
            Login
          </button>
        </section>
      )}

      {authenticated && (
        <>
          <section className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-[1rem] border border-white/[0.045] bg-black/22 p-4 lg:col-span-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                Best tier use vs expected next month use
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white/88">
                {projection.tier}
              </div>
              <p className="mt-2 text-sm leading-6 text-white/50">
                {projection.reason}
              </p>
            </div>

            <div className="rounded-[1rem] border border-[#AAB4FF]/12 bg-[#AAB4FF]/[0.040] p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#C9D0FF]/40">
                Projected next-month runtime
              </div>
              <div className="mt-3 text-sm font-medium text-[#D7DCFF]/86">
                {projection.level}
              </div>
              <p className="mt-2 text-xs leading-5 text-white/42">
                {projection.nextMonth}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            {visibleRecords.length === 0 ? (
              <div className="rounded-[1rem] border border-white/[0.045] bg-white/[0.010] p-5 text-sm leading-6 text-white/45">
                No LIVE prescriptions yet. Start a LIVE room, exit cleanly, and GEORGE will record the runtime composition.
              </div>
            ) : (
              visibleRecords.map((record, index) => (
                <article
                  key={record.id || `${record.createdAt}-${index}`}
                  className="rounded-[1rem] border border-white/[0.045] bg-white/[0.010] p-4 transition hover:border-white/[0.075] hover:bg-white/[0.016]"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-base font-semibold text-white/84">
                        {normalizeRoom(record)} · {formatDate(record.createdAt)}
                      </div>
                      <div className="mt-2 text-sm text-white/54">
                        {formatCost(record.estimatedCents)} estimated → {formatCost(record.actualCents)} actual
                      </div>
                    </div>

                    <div className="rounded-full border border-white/[0.045] bg-black/22 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/30">
                      LIVE Bx
                    </div>
                  </div>

                  <div className="mt-3 text-[12px] leading-6 text-white/42">
                    {normalizeComposition(record)}
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}
    </PageShell>
  )
}
