'use client'

import { useEffect, useMemo, useState } from 'react'
import PageShell from '@/components/layout/PageShell'

export default function TopUpPage() {
  const [intent, setIntent] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [feedback, setFeedback] = useState('')
  const [message, setMessage] = useState('')
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    setIntent(params.get('intent'))
  }, [])

  const headline = useMemo(() => {
    if (intent === 'make-george-yours') {
      return 'Make GEORGE yours.'
    }
    if (intent === 'conversation') {
      return 'Activate Conversation Assistance.'
    }
    if (intent === 'pro') {
      return 'Start Closing with Pro Conversation Partner.'
    }
    return 'Decide how far you want GEORGE to take you.'
  }, [intent])

  async function playVoiceSample(voice: string, label: string) {
    try {
      setPlayingVoice(voice)
      setMessage(`Playing ${label} sample...`)

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: 'This is GEORGE. Clear direction, real momentum, and the next best move.',
          speed: 1.15,
          tier: 'intelligent',
          voice,
        }),
      })

      if (!res.ok) {
        setMessage(`${label} is not available yet.`)
        return
      }

      const buffer = await res.arrayBuffer()
      const blob = new Blob([buffer], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)

      audio.onended = () => {
        URL.revokeObjectURL(url)
        setPlayingVoice(null)
        setMessage('')
      }

      await audio.play()
    } catch {
      setMessage('Unable to play voice sample right now.')
      setPlayingVoice(null)
    }
  }

  const subcopy = useMemo(() => {
    if (intent === 'make-george-yours') {
      return 'Choose GEORGE / GEORGette, personalize voice, and shape how your assistant supports your direction, continuity, and execution.'
    }
    if (intent === 'conversation') {
      return 'Conversation Assistance includes Brilliant access with live guidance, cues, exact lines, timing help, and pressure support when words matter.'
    }
    if (intent === 'pro') {
      return 'Pro Conversation Partner includes Brilliant access and is built for callers, reps, fundraisers, appointment setters, and firms that need live scripts, guardrails, and campaign discipline.'
    }
    return 'GEORGE is available now. Upgrade when you are ready for stronger continuity, sharper execution support, and more control over how GEORGE helps you move.'
  }, [intent])

  function submitFeedback() {
    if (!feedback.trim()) {
      setMessage('Add feedback first.')
      return
    }

    const payload = {
      type: feedbackType,
      feedback: feedback.trim(),
      source: 'george-feedback',
      timestamp: Date.now(),
    }

    const existing = JSON.parse(localStorage.getItem('GEORGE_FEEDBACK') || '[]')
    existing.push(payload)
    localStorage.setItem('GEORGE_FEEDBACK', JSON.stringify(existing))
    setMessage('Feedback saved. Thank you.')
    setFeedback('')
  }

  async function startCheckout(tier: 'intelligent' | 'brilliant') {
    try {
      setMessage('Opening secure checkout...')

      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      const data = await res.json()

      if (!res.ok || !data?.url) {
        setMessage(data?.error || 'Unable to start checkout right now.')
        return
      }

      window.location.href = data.url
    } catch {
      setMessage('Unable to start checkout right now.')
    }
  }

  function jumpTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <PageShell backToGeorge withSidebar={false}>
      <div className="space-y-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <div className="max-w-5xl space-y-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#7C8CFF]">
              BRANESx Beta
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {headline}
            </h1>

            <p className="max-w-3xl text-sm leading-7 text-neutral-300 md:text-base">
              {subcopy}
            </p>

            <div className="rounded-2xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-4 py-3 text-sm text-white/90">
              Brilliant gives you the edge when it matters — what to say, when to say it, and how to stay in control under pressure.
            </div>

            <div className="grid gap-4 pt-2 lg:grid-cols-4">
              <div className="rounded-[1.8rem] border border-[#7C8CFF]/40 bg-[#7C8CFF]/10 p-5 shadow-[0_0_40px_rgba(124,140,255,0.08)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white">Smart</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80">
                    Free
                  </span>
                </div>
                <div className="mb-3 text-3xl font-semibold tracking-tight text-white">$0</div>
                <ul className="space-y-2 text-sm leading-6 text-neutral-100">
                  <li>• See what actually matters</li>
                  <li>• Know what to focus on now</li>
                  <li>• Move in the right order</li>
                  <li>• Take the strongest first step</li>
                </ul>
              </div>

              <div className="rounded-[1.8rem] border border-white/15 bg-white/[0.04] p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white">Intelligent</p>
                  <span className="rounded-full border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#D7DDFF]">
                    Best value
                  </span>
                </div>
                <div className="mb-3 text-3xl font-semibold tracking-tight text-white">$9.99</div>
                <ul className="space-y-2 text-sm leading-6 text-neutral-300">
                  <li>• Stay on track across time</li>
                  <li>• Make better decisions under pressure</li>
                  <li>• Think clearer and move faster</li>
                  <li>• Turn plans into real progress</li>
                </ul>
                <button
                  type="button"
                  onClick={() => startCheckout('intelligent')}
                  className="mt-5 w-full rounded-full border border-[#7C8CFF]/35 bg-[#7C8CFF]/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-[#7C8CFF]/60 hover:bg-[#7C8CFF]/16"
                >
                  Move with Intelligent
                </button>
              </div>

              <div className="rounded-[1.8rem] border border-[#22c55e]/30 bg-[#22c55e]/10 p-5 shadow-[0_0_40px_rgba(34,197,94,0.08)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white">Pro Conversation Partner</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80">
                    ROI
                  </span>
                </div>
                <div className="mb-3 text-3xl font-semibold tracking-tight text-white">$49+</div>
                <ul className="space-y-2 text-sm leading-6 text-neutral-100">
                  <li>• Stay sharp on every call</li>
                  <li>• Know what to say in real time</li>
                  <li>• Recover fast and keep momentum</li>
                  <li>• Improve results with every attempt</li>
                </ul>
                <button
                  type="button"
                  onClick={() => startCheckout('brilliant')}
                  className="mt-5 w-full rounded-full border border-[#22c55e]/45 bg-[#22c55e]/14 px-4 py-3 text-sm font-semibold text-white transition hover:border-[#22c55e]/70 hover:bg-[#22c55e]/20"
                >
                  Start Closing with Pro
                </button>
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white">Brilliant</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
                    Full engine
                  </span>
                </div>
                <div className="mb-3 text-3xl font-semibold tracking-tight text-white">$25</div>
                <ul className="space-y-2 text-sm leading-6 text-neutral-400">
                  <li>• Know what to say before you say it</li>
                  <li>• Stay composed under pressure</li>
                  <li>• Read the room and adjust instantly</li>
                  <li>• Move forward without hesitation</li>
                </ul>
                <button
                  type="button"
                  onClick={() => startCheckout('brilliant')}
                  className="mt-5 w-full rounded-full bg-[#7C8CFF] px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  Enter Brilliant Mode
                </button>
              </div>
            </div>

            
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div id="feedback" className="scroll-mt-24 rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6">
            <div className="space-y-4">
              <p className="text-sm font-medium text-white">Comments and suggestions</p>
              <p className="text-sm leading-7 text-neutral-300">
                Tell us what feels confusing, useful, missing, or worth improving.
              </p>

              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
              >
                <option value="suggestion">Suggestion</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature request</option>
                <option value="confusion">Something felt confusing</option>
              </select>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                placeholder="What should change?"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <button
                type="button"
                onClick={submitFeedback}
                className="w-full rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-[#7C8CFF]"
              >
                Save feedback
              </button>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
