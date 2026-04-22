'use client'

import { useEffect, useMemo, useState } from 'react'
import PageShell from '@/components/layout/PageShell'

export default function TopUpPage() {
  const [intent, setIntent] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [feedback, setFeedback] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    setIntent(params.get('intent'))
    if (window.location.hash === '#waitlist') {
      setTimeout(() => {
        document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [])

  const headline = useMemo(() => {
    if (intent === 'make-george-yours') {
      return 'Join the beta waitlist.'
    }
    return 'BRANESx is in beta.'
  }, [intent])

  const subcopy = useMemo(() => {
    if (intent === 'make-george-yours') {
      return 'GEORGE is already useful. Waitlist access helps us notify you when paid tiers and deeper rollout are ready.'
    }
    return 'Paid access is not live yet. Use GEORGE now, join the waitlist, and help shape what gets better before broader launch.'
  }, [intent])

  async function joinWaitlist() {
    if (!email.trim()) {
      setMessage('Enter an email first.')
      return
    }

    setMessage('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          note: note.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data?.error || 'Something went wrong.')
        return
      }

      setMessage('You are on the waitlist. Check your email for confirmation.')
      setEmail('')
      setName('')
      setNote('')
    } catch {
      setMessage('Unable to submit right now.')
    }
  }

  function submitFeedback() {
    if (!feedback.trim()) {
      setMessage('Add feedback first.')
      return
    }

    const payload = {
      type: feedbackType,
      feedback: feedback.trim(),
      email: email.trim(),
      source: 'beta-feedback',
      timestamp: Date.now(),
    }

    const existing = JSON.parse(localStorage.getItem('GEORGE_FEEDBACK') || '[]')
    existing.push(payload)
    localStorage.setItem('GEORGE_FEEDBACK', JSON.stringify(existing))
    setMessage('Feedback saved. Thank you.')
    setFeedback('')
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
              Brilliant unlocks Conversation Engine, live cues, and premium earbud guidance.
            </div>

            <div className="grid gap-4 pt-2 lg:grid-cols-3">
              <div className="rounded-[1.8rem] border border-[#7C8CFF]/40 bg-[#7C8CFF]/10 p-5 shadow-[0_0_40px_rgba(124,140,255,0.08)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white">Brilliant</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80">
                    Full engine
                  </span>
                </div>
                <div className="mb-3 text-3xl font-semibold tracking-tight text-white">$25</div>
                <ul className="space-y-2 text-sm leading-6 text-neutral-100">
                  <li>• Conversation Engine</li>
                  <li>• Earbud live guidance</li>
                  <li>• Live cues and room awareness</li>
                  <li>• Strongest pressure support</li>
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
                  <li>• Stronger continuity</li>
                  <li>• Sharper reasoning</li>
                  <li>• Better planning and framing</li>
                  <li>• Better for active goals</li>
                </ul>
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white">Smart</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
                    Free
                  </span>
                </div>
                <div className="mb-3 text-3xl font-semibold tracking-tight text-white">$0</div>
                <ul className="space-y-2 text-sm leading-6 text-neutral-400">
                  <li>• Quick clarity</li>
                  <li>• Immediate next moves</li>
                  <li>• Useful without setup</li>
                  <li>• Start using GEORGE now</li>
                </ul>
              </div>
            </div>

            <div className="grid gap-3 pt-1 md:grid-cols-3">
              <button
                type="button"
                onClick={() => (window.location.href = '/george')}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-neutral-300 transition hover:border-white/20 hover:text-white"
              >
                Use GEORGE now
              </button>
              <button
                type="button"
                onClick={() => jumpTo('waitlist')}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-neutral-300 transition hover:border-[#7C8CFF] hover:text-white"
              >
                Join the waitlist
              </button>
              <button
                type="button"
                onClick={() => jumpTo('feedback')}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-neutral-300 transition hover:border-[#7C8CFF] hover:text-white"
              >
                Send feedback
              </button>
            </div>

            {message ? (
              <div className="rounded-2xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-4 py-3 text-sm text-white">
                {message}
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div id="waitlist" className="scroll-mt-24 rounded-3xl border border-[#7C8CFF]/40 bg-[#7C8CFF]/10 p-6">
            <div className="space-y-4">
              <p className="text-sm font-medium text-white">Waitlist</p>
              <p className="text-sm leading-7 text-neutral-300">
                Leave your email so we can notify you when paid access, deeper rollout, and launch access are ready.
              </p>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Best email"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="mb-3 text-sm font-medium text-white">
                  What do you want from GEORGE?
                </p>
                <p className="mb-4 text-xs text-neutral-400">
                  Select all that apply
                </p>

                <div className="grid gap-3 text-sm text-neutral-200 md:grid-cols-2">
                  {[
                    'Better decision making',
                    'Motivation / discipline',
                    'Business growth help',
                    'More money / income ideas',
                    'Career direction',
                    'Confidence in conversations',
                    'Relationship guidance',
                    'Credit / financial improvement',
                    'Daily structure / planning',
                    'Biblical wisdom guidance',
                    'Reduce confusion / clarity',
                    'Other'
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={item}
                        onChange={(e) => {
                          const v = e.target.value
                          const arr = note ? note.split(' | ') : []
                          if (e.target.checked) {
                            if (!arr.includes(v)) setNote([...arr, v].join(' | '))
                          } else {
                            setNote(arr.filter(x => x !== v).join(' | '))
                          }
                        }}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Optional: add details or type your own answer"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <button
                type="button"
                onClick={joinWaitlist}
                className="w-full rounded-full bg-[#7C8CFF] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Get Early Access
              </button>
            </div>
          </div>

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
