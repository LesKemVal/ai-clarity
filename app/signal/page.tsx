'use client'

import { useEffect, useMemo, useState } from 'react'

type Tier = 'smart' | 'intelligent' | 'brilliant'

export default function SignalPage() {

  const [tier, setTier] = useState<Tier>('smart')
  const [ready, setReady] = useState(false)
  const [hasSavedSignal, setHasSavedSignal] = useState(false)

  const [name, setName] = useState('')
  const [mission, setMission] = useState('')
  const [priority, setPriority] = useState('')
  const [learningStyle, setLearningStyle] = useState('')
  const [adaptiveAnswer, setAdaptiveAnswer] = useState('')
  const [adaptiveQuestion, setAdaptiveQuestion] = useState('')

  useEffect(() => {
    setTier((localStorage.getItem('george_tier') || 'smart') as Tier)
    setName(localStorage.getItem('george_name') || '')
    setHasSavedSignal(
      !!(
        localStorage.getItem('george_user_mission') ||
        localStorage.getItem('george_user_priority') ||
        localStorage.getItem('george_user_learning_style') ||
        localStorage.getItem('george_user_adaptive_answer')
      )
    )
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
      return 'What should GEORGE understand first — your main goal, current pressure, project, relationship, risk, or next decision?'
    }

    if (/business|startup|company|sell|sales|income|money|fund|revenue|project|product|launch|platform|app/.test(text)) {
      return 'What should GEORGE learn about this project first — the outcome, customer, revenue path, blocker, timeline, risk, or leverage point?'
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

    return 'What question would help GEORGE understand you better right now — how you decide, communicate, slow down, push forward, lose momentum, or define success?'
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
        <div className="absolute left-1/2 top-[-180px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-white/[0.018] blur-[76px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/[0.05]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <button
          onClick={() => (window.location.href = '/george')}
          className="text-sm text-white/48 transition hover:text-white/72"
        >
          ← Back to GEORGE
        </button>

        <div className="space-y-6 rounded-[1rem] border border-white/[0.05] bg-white/[0.015] p-5 shadow-[0_12px_34px_rgba(0,0,0,0.28)] md:p-6">
          <img
            src="/logofav.png"
            alt="BRANESx"
            className="h-20 w-20 rounded-[1.2rem] object-contain opacity-90 md:h-24 md:w-24"
          />

          <div className="space-y-2 border-b border-white/[0.05] pb-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">
              Signal
            </p>
            <h1 className="max-w-3xl text-[2.4rem] font-semibold tracking-[-0.06em] text-white md:text-[3.2rem]">
              Give GEORGE better signal.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-white/44 md:text-[15px]">
              Answer a few questions so GEORGE can understand what matters, ask sharper follow-ups, and stay useful as your goals, projects, pressure, and context change.
            </p>
            {hasSavedSignal && (
              <p className="max-w-3xl rounded-[0.8rem] border border-white/[0.045] bg-black/20 px-4 py-3 text-xs leading-5 text-white/42">
                GEORGE already has saved signal. Add new signal here when your goal, pressure, or working style changes.
              </p>
            )}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Working signal</p>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should GEORGE call you?"
                  className="rounded-[0.82rem] border border-white/[0.06] bg-black/24 px-4 py-2.5 text-white outline-none placeholder:text-white/28"
                />
                <input
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="What is your goal right now?"
                  className="rounded-[0.82rem] border border-white/[0.06] bg-black/24 px-4 py-2.5 text-white outline-none placeholder:text-white/28"
                />
                <input
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  placeholder="What should GEORGE account for right now?"
                  className="rounded-[0.82rem] border border-white/[0.06] bg-black/24 px-4 py-2.5 text-white outline-none placeholder:text-white/28"
                />

                <input
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  placeholder="How should GEORGE work with you?"
                  className="rounded-[0.82rem] border border-white/[0.06] bg-black/24 px-4 py-2.5 text-white outline-none placeholder:text-white/28"
                />
              </div>
            </div>

            <div className="rounded-[0.9rem] border border-white/[0.045] bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
                Continuity layer
              </p>
              <p className="mt-3 text-sm leading-6 text-white/48">
                GEORGE can later connect to calendars, repositories, files, email, documents, or other systems when continuity and real work require it.
              </p>
              <p className="mt-3 text-xs leading-5 text-white/38">
                Connections should remain selective, permissioned, and operationally useful.
              </p>
            </div>
          </div>

          <div className="rounded-[0.9rem] border border-white/[0.05] bg-black/18 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">
              Adaptive signal
            </p>
            <p className="mt-2 text-sm leading-6 text-white/78">
              {adaptiveQuestion}
            </p>
            <textarea
              value={adaptiveAnswer}
              onChange={(e) => setAdaptiveAnswer(e.target.value)}
              rows={3}
              placeholder="What should GEORGE understand before helping you move forward?"
              className="mt-3 w-full rounded-[0.82rem] border border-white/[0.06] bg-black/24 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/28"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={save}
              disabled={!valid}
              className="rounded-[0.9rem] bg-white px-6 py-3.5 text-sm font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7] disabled:opacity-40"
            >
              Signal
            </button>

            <p className="text-xs leading-5 text-white/32">
              Update what GEORGE should account for when your goal, pressure, or working style changes.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
