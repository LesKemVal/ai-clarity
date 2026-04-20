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

  function joinWaitlist() {
    if (!email.trim()) {
      setMessage('Enter an email first.')
      return
    }

    const payload = {
      email: email.trim(),
      name: name.trim(),
      note: note.trim(),
      source: 'waitlist',
      timestamp: Date.now(),
    }

    const existing = JSON.parse(localStorage.getItem('GEORGE_WAITLIST') || '[]')
    existing.push(payload)
    localStorage.setItem('GEORGE_WAITLIST', JSON.stringify(existing))
    setMessage('You are on the waitlist.')
    setEmail('')
    setName('')
    setNote('')
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

  return (
    <PageShell backToGeorge withSidebar={false}>
      <div className="space-y-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <div className="max-w-4xl space-y-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#7C8CFF]">
              BRANESx Beta
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {headline}
            </h1>

            <p className="max-w-3xl text-sm leading-7 text-neutral-300 md:text-base">
              {subcopy}
            </p>

            <div className="grid gap-3 pt-2 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-300">
                Use GEORGE now
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-300">
                Join the waitlist
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-300">
                Send feedback
              </div>
            </div>

            {message ? (
              <div className="rounded-2xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-4 py-3 text-sm text-white">
                {message}
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#7C8CFF]/40 bg-[#7C8CFF]/10 p-6">
            <div className="space-y-4">
              <p className="text-sm font-medium text-white">Waitlist</p>
              <p className="text-sm leading-7 text-neutral-300">
                Leave your email so we can notify you when paid access, deeper rollout, and launch access are ready.
              </p>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (optional)"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="What do you want most from GEORGE? (optional)"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <button
                type="button"
                onClick={joinWaitlist}
                className="w-full rounded-full bg-[#7C8CFF] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Join the waitlist
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6">
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

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <div className="max-w-4xl space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              What we are testing right now
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-neutral-300">
                How people actually use GEORGE across Smart, Intelligent, and Brilliant.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-neutral-300">
                How clearly users understand Conversation Engine, voice controls, and LIVE cues.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-neutral-300">
                How to help people find courses, tools, and credible resources through GEORGE.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-neutral-300">
                What should be strengthened before broad launch.
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
