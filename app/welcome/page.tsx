'use client'

import { useEffect, useMemo, useState } from 'react'

type Tier = 'smart' | 'intelligent' | 'brilliant'

export default function WelcomePage() {

  const [tier, setTier] = useState<Tier>('smart')
  const [ready, setReady] = useState(false)

  const [name, setName] = useState('')
  const [mission, setMission] = useState('')
  const [priority, setPriority] = useState('')
  const [supportProfile, setSupportProfile] = useState('')
  const [operationalContext, setOperationalContext] = useState('')

  useEffect(() => {
    setTier((localStorage.getItem('george_tier') || 'smart') as Tier)
    setName(localStorage.getItem('george_name') || '')
    setMission(localStorage.getItem('george_user_mission') || '')
    setPriority(localStorage.getItem('george_user_priority') || '')
    setSupportProfile(localStorage.getItem('george_user_support_profile') || '')
    setOperationalContext(localStorage.getItem('george_user_operational_context') || '')
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    if (tier === 'smart') {
      window.location.replace('/top-up?intent=make-george-yours')
    }
  }, [ready, tier])

  const valid = useMemo(() => {
    return !!(name && mission && priority)
  }, [name, mission, priority])

  function save() {
    if (!valid) return

    localStorage.setItem('george_onboarded', 'true')
    localStorage.setItem('george_active', 'true')
    localStorage.setItem('george_name', name)
    localStorage.setItem('george_user_mission', mission)
    localStorage.setItem('george_user_priority', priority)
    localStorage.setItem('george_user_support_profile', supportProfile)
    localStorage.setItem('george_user_operational_context', operationalContext)

    window.location.href = '/george'
  }

  if (!ready) return null
  if (tier === 'smart') return null

  return (
    <main className="min-h-screen bg-[#080A12] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          onClick={() => (window.location.href = '/george')}
          className="text-sm text-white/70 transition hover:text-white"
        >
          ← Back to GEORGE
        </button>

        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-[#7C8CFF]">
              Make GEORGE yours
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">
              Help GEORGE recognize your direction.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-neutral-300 md:text-base">
              Start with the signal that matters now. GEORGE can ask more precise questions over time as your goals, context, and preferred support become clearer.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should GEORGE call you?"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <input
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="What are you trying to become, build, fix, fund, or change?"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <input
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="What should GEORGE pay attention to first?"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 md:col-span-2"
            />
          </div>

          <textarea
            value={supportProfile}
            onChange={(e) => setSupportProfile(e.target.value)}
            rows={4}
            placeholder="Optional: how should GEORGE support your decisions, conversations, work, or learning?"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
          />

          <textarea
            value={operationalContext}
            onChange={(e) => setOperationalContext(e.target.value)}
            rows={4}
            placeholder="Optional: add any context GEORGE should remember about your current objective, environment, or next milestone."
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
          />

          <div className="rounded-2xl border border-[#7C8CFF]/24 bg-[#7C8CFF]/[0.08] px-4 py-3 text-sm leading-7 text-white/82">
            This is not a fixed personality quiz. It is the first signal. GEORGE should keep refining support through use, saved context, and the questions that become relevant later.
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={save}
              disabled={!valid}
              className="rounded-full bg-[#7C8CFF] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-40"
            >
              Make GEORGE Mine
            </button>

            <button
              onClick={() => window.open('/roadmap','_blank','noopener,noreferrer')}
              className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-[#7C8CFF]"
            >
              Why Users Upgrade
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
