'use client'

import { useEffect, useMemo, useState } from 'react'

type Tier = 'smart' | 'intelligent' | 'brilliant'

export default function WelcomePage() {

  const [tier, setTier] = useState<Tier>('smart')
  const [ready, setReady] = useState(false)

  const [name, setName] = useState('')
  const [mission, setMission] = useState('')
  const [priority, setPriority] = useState('')
  const [weeklyTime, setWeeklyTime] = useState('')
  const [learningStyle, setLearningStyle] = useState('')
  const [tone, setTone] = useState('')
  const [friction, setFriction] = useState('')
  const [adaptiveAnswer, setAdaptiveAnswer] = useState('')
  const [adaptiveQuestion, setAdaptiveQuestion] = useState('')

  useEffect(() => {
    setTier((localStorage.getItem('george_tier') || 'smart') as Tier)
    setName(localStorage.getItem('george_name') || '')
    setMission(localStorage.getItem('george_user_mission') || '')
    setPriority(localStorage.getItem('george_user_priority') || '')
    setWeeklyTime(localStorage.getItem('george_user_weekly_time') || '')
    setLearningStyle(localStorage.getItem('george_user_learning_style') || '')
    setTone(localStorage.getItem('george_user_tone') || '')
    setFriction(localStorage.getItem('george_user_friction') || '')
    setAdaptiveAnswer(localStorage.getItem('george_user_adaptive_answer') || '')
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    if (tier === 'smart') {
      window.location.replace('/top-up?intent=make-george-yours')
    }
  }, [ready, tier])

  const adaptivePrompt = useMemo(() => {
    const text = `${mission} ${priority} ${friction}`.toLowerCase()

    if (!mission && !priority && !friction) {
      return 'What are you trying to become, build, fix, or handle right now?'
    }

    if (/business|startup|company|sell|sales|income|money|fund|revenue/.test(text)) {
      return 'What does this need to do first: create fast income, prove demand, or become long-term ownership?'
    }

    if (/interview|job|career|hiring|resume|work/.test(text)) {
      return 'Where do you usually lose ground: preparation, confidence, wording, follow-up, or negotiating value?'
    }

    if (/conversation|meeting|negotiat|doctor|appointment|sales call|call|live|boss|manager/.test(text)) {
      return 'In live conversations, do you need GEORGE to help more with what to say, when to pause, or what question to ask next?'
    }

    if (/learn|study|test|exam|license|school|training|skill/.test(text)) {
      return 'When you learn, what usually breaks momentum: time, focus, confidence, boredom, confusion, or not knowing what to do next?'
    }

    if (/credit|debt|bill|approval|car|house|loan/.test(text)) {
      return 'What matters most right now: faster approval, lower monthly pressure, cleaner credit profile, or avoiding a bad deal?'
    }

    return 'What should GEORGE understand about how you move under pressure?'
  }, [mission, priority, friction])

  useEffect(() => {
    setAdaptiveQuestion(adaptivePrompt)
  }, [adaptivePrompt])

  const valid = useMemo(() => {
    return !!(name && mission && priority && weeklyTime && learningStyle && tone && friction && adaptiveAnswer)
  }, [name, mission, priority, weeklyTime, learningStyle, tone, friction, adaptiveAnswer])

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
    localStorage.setItem('george_user_adaptive_question', adaptiveQuestion)
    localStorage.setItem('george_user_adaptive_answer', adaptiveAnswer)

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

        <div className="space-y-6 rounded-[1.35rem] border border-white/[0.05] bg-white/[0.018] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-[#7C8CFF]">
              Make GEORGE yours
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">
              Build a GEORGE that understands your motion.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-neutral-300 md:text-base">
              Give GEORGE real signal now, so guidance becomes sharper, faster, and more useful over time.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should GEORGE call you?"
              className="rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <input
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="What are you trying to build, fix, fund, or change?"
              className="rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <input
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="What matters most right now?"
              className="rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <input
              value={weeklyTime}
              onChange={(e) => setWeeklyTime(e.target.value)}
              placeholder="How much time can you really give this weekly?"
              className="rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <input
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
              placeholder="How do you learn best?"
              className="rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <input
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="How should GEORGE speak to you?"
              className="rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
          </div>

          <textarea
            value={friction}
            onChange={(e) => setFriction(e.target.value)}
            rows={4}
            placeholder="What usually gets in your way?"
            className="w-full rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
          />

          <div className="rounded-2xl border border-[#7C8CFF]/14 bg-[#7C8CFF]/[0.055] p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#AEB6FF]/80">
              GEORGE asks next
            </p>
            <p className="mt-2 text-sm leading-6 text-white/78">
              {adaptiveQuestion}
            </p>
            <textarea
              value={adaptiveAnswer}
              onChange={(e) => setAdaptiveAnswer(e.target.value)}
              rows={3}
              placeholder="Answer this so GEORGE can support you more precisely."
              className="mt-3 w-full rounded-xl border border-white/[0.05] bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
            />
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
              className="rounded-full border border-white/[0.05] px-6 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-[#7C8CFF]"
            >
              Why Users Upgrade
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
