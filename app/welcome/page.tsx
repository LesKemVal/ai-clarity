'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Tier = 'smart' | 'intelligent' | 'brilliant'

export default function WelcomePage() {
  const router = useRouter()

  const [tier, setTier] = useState<Tier>('smart')
  const [ready, setReady] = useState(false)

  const [name, setName] = useState('')
  const [mission, setMission] = useState('')
  const [priority, setPriority] = useState('')
  const [weeklyTime, setWeeklyTime] = useState('')
  const [learningStyle, setLearningStyle] = useState('')
  const [tone, setTone] = useState('')
  const [friction, setFriction] = useState('')

  useEffect(() => {
    setTier((localStorage.getItem('george_tier') || 'smart') as Tier)
    setName(localStorage.getItem('george_name') || '')
    setMission(localStorage.getItem('george_user_mission') || '')
    setPriority(localStorage.getItem('george_user_priority') || '')
    setWeeklyTime(localStorage.getItem('george_user_weekly_time') || '')
    setLearningStyle(localStorage.getItem('george_user_learning_style') || '')
    setTone(localStorage.getItem('george_user_tone') || '')
    setFriction(localStorage.getItem('george_user_friction') || '')
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    if (tier === 'smart') {
      window.location.replace('/top-up?intent=make-george-yours')
    }
  }, [ready, tier])

  const valid = useMemo(() => {
    return !!(name && mission && priority && weeklyTime && learningStyle && tone && friction)
  }, [name, mission, priority, weeklyTime, learningStyle, tone, friction])

  function save() {
    if (!valid) return

    localStorage.setItem('george_onboarded', 'true')
    localStorage.setItem('george_active', 'true')
    localStorage.setItem('george_name', name)
    localStorage.setItem('george_user_mission', mission)
    localStorage.setItem('george_user_priority', priority)
    localStorage.setItem('george_user_weekly_time', weeklyTime)
    localStorage.setItem('george_user_learning_style', learningStyle)
    localStorage.setItem('george_user_tone', tone)
    localStorage.setItem('george_user_friction', friction)

    window.location.href = '/george'
  }

  if (!ready) return null
  if (tier === 'smart') return null

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
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
              Let GEORGE learn who he&apos;s working for.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-neutral-300 md:text-base">
              Keep it honest. Keep it simple. This is not about building a profile. This is about giving GEORGE enough signal to be more useful over time.
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
              placeholder="What are you trying to build, fix, or become?"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <input
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="What matters most right now?"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <input
              value={weeklyTime}
              onChange={(e) => setWeeklyTime(e.target.value)}
              placeholder="How much time can you really give this weekly?"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <input
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
              placeholder="How do you learn best?"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <input
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="How should GEORGE speak to you?"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
          </div>

          <textarea
            value={friction}
            onChange={(e) => setFriction(e.target.value)}
            rows={5}
            placeholder="What usually gets in your way?"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
          />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={save}
              disabled={!valid}
              className="rounded-full bg-[#7C8CFF] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-40"
            >
              Activate my GEORGE
            </button>

            <button
              onClick={() => window.open('/roadmap','_blank','noopener,noreferrer')}
              className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-[#7C8CFF]"
            >
              Review the value first
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
