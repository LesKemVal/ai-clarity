'use client'

import { useEffect, useMemo, useState } from 'react'

type Tier = 'smart' | 'intelligent' | 'brilliant'

export default function WelcomePage() {

  const [tier, setTier] = useState<Tier>('smart')
  const [ready, setReady] = useState(false)

  const [name, setName] = useState('')
  const [mission, setMission] = useState('')
  const [priority, setPriority] = useState('')
  const [learningStyle, setLearningStyle] = useState('')
  const [adaptiveAnswer, setAdaptiveAnswer] = useState('')
  const [adaptiveQuestion, setAdaptiveQuestion] = useState('')

  useEffect(() => {
    setTier((localStorage.getItem('george_tier') || 'smart') as Tier)
    setName(localStorage.getItem('george_name') || '')
    setMission(localStorage.getItem('george_user_mission') || '')
    setPriority(localStorage.getItem('george_user_priority') || '')
    setLearningStyle(localStorage.getItem('george_user_learning_style') || '')
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
    const text = `${mission} ${priority}`.toLowerCase()

    if (!mission && !priority) {
      return 'What are we trying to move forward right now — something to become, build, fix, fund, protect, or decide?'
    }

    if (/business|startup|company|sell|sales|income|money|fund|revenue/.test(text)) {
      return 'Should I help you optimize first for fast income, proof of demand, ownership, funding readiness, or long-term leverage?'
    }

    if (/interview|job|career|hiring|resume|work/.test(text)) {
      return 'Should I help most with preparation, sharper wording, stronger positioning, follow-through, or negotiation?'
    }

    if (/conversation|meeting|negotiat|doctor|appointment|sales call|call|live|boss|manager/.test(text)) {
      return 'When pressure rises, should I prioritize exact lines, short cues, questions to ask, posture, or silence?'
    }

    if (/learn|study|test|exam|license|school|training|skill/.test(text)) {
      return 'Do you learn best through repetition, conversation, pressure, structure, visuals, examples, or direct execution?'
    }

    if (/credit|debt|bill|approval|car|house|loan/.test(text)) {
      return 'Should I help you protect approval odds, lower monthly pressure, clean up the profile, or avoid a bad deal?'
    }

    return 'What should I understand about how you decide, communicate, slow down, push forward, or lose momentum?'
  }, [mission, priority])

  useEffect(() => {
    setAdaptiveQuestion(adaptivePrompt)
  }, [adaptivePrompt])

  const valid = useMemo(() => {
    return !!(name && mission && priority && learningStyle && adaptiveAnswer)
  }, [name, mission, priority, learningStyle, adaptiveAnswer])

  function save() {
    if (!valid) return

    localStorage.setItem('george_onboarded', 'true')
    localStorage.setItem('george_active', 'true')
    localStorage.setItem('george_name', name)
    localStorage.setItem('george_user_mission', mission)
    localStorage.setItem('george_user_priority', priority)
    localStorage.setItem('george_user_learning_style', learningStyle)
    localStorage.setItem('george_user_adaptive_question', adaptiveQuestion)
    localStorage.setItem('george_user_adaptive_answer', adaptiveAnswer)

    window.location.href = '/george'
  }

  if (!ready) return null
  if (tier === 'smart') return null

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060A] px-6 py-10 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-260px] h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[130px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/[0.05]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <button
          onClick={() => (window.location.href = '/george')}
          className="text-sm text-white/48 transition hover:text-white/72"
        >
          ← Back to GEORGE
        </button>

        <div className="space-y-7 rounded-[1rem] border border-white/[0.04] bg-white/[0.012] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.46)] md:p-7">
          <img
            src="/logofav.png"
            alt="BRANESx"
            className="h-24 w-24 rounded-[1.6rem] object-contain opacity-94 md:h-28 md:w-28"
          />

          <div className="space-y-3 border-b border-white/[0.045] pb-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">
              Continuity Signal
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
              Establish continuity.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-white/48 md:text-base">
              GEORGE uses this to understand what matters, how you operate, and how to stay useful as pressure, goals, and context change.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Core signal</p>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should I call you?"
                  className="rounded-[0.85rem] border border-white/[0.05] bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/28"
                />
                <input
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="What are we trying to build, fix, fund, or change?"
                  className="rounded-[0.85rem] border border-white/[0.05] bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/28"
                />
                <input
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  placeholder="What matters most right now?"
                  className="rounded-[0.85rem] border border-white/[0.05] bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/28"
                />

                <input
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  placeholder="How should I communicate or work with you?"
                  className="rounded-[0.85rem] border border-white/[0.05] bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/28"
                />
              </div>
            </div>

            <div className="rounded-[0.9rem] border border-white/[0.045] bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
                Connected Systems
              </p>
              <p className="mt-3 text-sm leading-6 text-white/48">
                GEORGE can later connect to calendars, repositories, files, email, documents, or other systems when continuity and real work require it.
              </p>
              <p className="mt-3 text-xs leading-5 text-white/38">
                Connections should remain selective, permissioned, and operationally useful.
              </p>
            </div>
          </div>

          <div className="rounded-[0.95rem] border border-white/[0.045] bg-black/24 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">
              GEORGE asks
            </p>
            <p className="mt-2 text-sm leading-6 text-white/78">
              {adaptiveQuestion}
            </p>
            <textarea
              value={adaptiveAnswer}
              onChange={(e) => setAdaptiveAnswer(e.target.value)}
              rows={3}
              placeholder="Answer directly. GEORGE uses this to preserve continuity and adapt intelligently over time."
              className="mt-3 w-full rounded-[0.85rem] border border-white/[0.05] bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={save}
              disabled={!valid}
              className="rounded-[0.9rem] bg-white px-6 py-3.5 text-sm font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7] disabled:opacity-40"
            >
              Establish Continuity
            </button>

            <p className="text-xs leading-5 text-white/32">
              As your situation changes, GEORGE should adapt with it.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
