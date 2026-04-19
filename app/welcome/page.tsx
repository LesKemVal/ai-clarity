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
    if (tier === 'smart') router.replace('/top-up?intent=make-george-yours')
  }, [ready, tier, router])

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

    router.push('/george')
  }

  if (!ready) return null
  if (tier === 'smart') return null

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <button onClick={() => router.push('/george')} className="text-white/70 hover:text-white">
          ← Back to GEORGE
        </button>

        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-[#7C8CFF]">Make GEORGE yours</p>
            <h1 className="text-4xl font-semibold">Let GEORGE learn who he&apos;s working for.</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3" />
            <input value={mission} onChange={e => setMission(e.target.value)} placeholder="Mission" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3" />
            <input value={priority} onChange={e => setPriority(e.target.value)} placeholder="Priority" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3" />
            <input value={weeklyTime} onChange={e => setWeeklyTime(e.target.value)} placeholder="Weekly time" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3" />
            <input value={learningStyle} onChange={e => setLearningStyle(e.target.value)} placeholder="Learning style" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3" />
            <input value={tone} onChange={e => setTone(e.target.value)} placeholder="Preferred tone" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3" />
          </div>

          <textarea value={friction} onChange={e => setFriction(e.target.value)} rows={5} placeholder="What gets in your way?" className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3" />

          <div className="flex flex-wrap gap-3">
            <button onClick={save} disabled={!valid} className="rounded-full bg-[#7C8CFF] px-6 py-3 text-black disabled:opacity-40">
              Activate my GEORGE
            </button>

            <button onClick={() => router.push('/roadmap')} className="rounded-full border border-white/10 px-6 py-3">
              Why this matters
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
