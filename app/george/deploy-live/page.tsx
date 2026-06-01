'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type ChairKey =
  | 'Interview'
  | 'Meeting'
  | 'Boardroom'
  | 'Negotiation'
  | 'Sales Call'
  | 'Doctor Appointment'
  | 'Presentation'
  | 'Everyday Conversation'
  | 'Other'

const chairProfiles: Record<ChairKey, {
  examples: string[]
  looksFor: string[]
  steering: { phrase: string; meaning: string }[]
  prompt: string
}> = {
  Interview: {
    examples: ['Résumé', 'Job description', 'Portfolio', 'Certifications', 'Interview notes'],
    looksFor: ['Proof points', 'Likely questions', 'Gaps', 'Confidence risks', 'Strong answers'],
    steering: [
      { phrase: 'Let me think.', meaning: 'Buy time before answering' },
      { phrase: 'That’s a good question.', meaning: 'Prepare a structured answer' },
      { phrase: 'Can I clarify that?', meaning: 'Repair unclear question' },
      { phrase: 'Right.', meaning: 'Continue with confidence' },
    ],
    prompt: 'Give GEORGE role details, job requirements, achievements, weak spots, and questions you expect.',
  },
  Meeting: {
    examples: ['Agenda', 'Decision notes', 'Stakeholder list', 'Numbers', 'Email thread'],
    looksFor: ['Decision pressure', 'Alignment', 'Timing', 'Risks', 'Next move'],
    steering: [
      { phrase: 'Let’s pause there.', meaning: 'Slow the room down' },
      { phrase: 'What’s the decision?', meaning: 'Force clarity' },
      { phrase: 'One second.', meaning: 'Buy time' },
      { phrase: 'Let’s define that.', meaning: 'Clarify vague language' },
    ],
    prompt: 'Give GEORGE the meeting goal, who is present, what decision matters, and what cannot be missed.',
  },
  Boardroom: {
    examples: ['Board packet', 'Forecast', 'KPIs', 'Financial report', 'Meeting notes'],
    looksFor: ['Assumptions', 'Risk', 'Variance', 'Credibility', 'Capital allocation'],
    steering: [
      { phrase: 'Let me separate that.', meaning: 'Break issue into parts' },
      { phrase: 'The assumption is...', meaning: 'Defend methodology' },
      { phrase: 'That depends on...', meaning: 'Qualify answer' },
      { phrase: 'Let’s isolate the risk.', meaning: 'Focus the board' },
    ],
    prompt: 'Give GEORGE the numbers, assumptions, risks, likely objections, and who has authority in the room.',
  },
  Negotiation: {
    examples: ['Offer', 'Contract', 'Term sheet', 'Pricing sheet', 'Email thread'],
    looksFor: ['Leverage', 'Concessions', 'Deadlines', 'Alternatives', 'Pressure'],
    steering: [
      { phrase: 'Let me consider that.', meaning: 'Do not concede too fast' },
      { phrase: 'That does not work as stated.', meaning: 'Reject without overexplaining' },
      { phrase: 'What flexibility is there?', meaning: 'Probe movement' },
      { phrase: 'I need that in writing.', meaning: 'Protect position' },
    ],
    prompt: 'Give GEORGE your target, fallback, leverage, deadline, other party’s pressure, and what you cannot give up.',
  },
  'Sales Call': {
    examples: ['Pitch notes', 'CRM notes', 'Proposal', 'Objection list', 'Competitor notes'],
    looksFor: ['Pain points', 'Buying signals', 'Objections', 'Decision maker', 'Close timing'],
    steering: [
      { phrase: 'That makes sense.', meaning: 'Acknowledge objection' },
      { phrase: 'What matters most?', meaning: 'Find buying motive' },
      { phrase: 'Let me make it simple.', meaning: 'Compress pitch' },
      { phrase: 'Should we set the next step?', meaning: 'Move toward close' },
    ],
    prompt: 'Give GEORGE the product, prospect, pain point, offer, objections, and desired next step.',
  },
  'Doctor Appointment': {
    examples: ['Symptoms', 'Medication list', 'Lab results', 'Timeline', 'Questions'],
    looksFor: ['Symptoms', 'History', 'Risks', 'Missed questions', 'Treatment clarity'],
    steering: [
      { phrase: 'Can you explain that plainly?', meaning: 'Clarify medical language' },
      { phrase: 'What should I watch for?', meaning: 'Surface risk signs' },
      { phrase: 'What are my options?', meaning: 'Compare choices' },
      { phrase: 'Can we go back to symptoms?', meaning: 'Refocus appointment' },
    ],
    prompt: 'Give GEORGE symptoms, timeline, medications, concerns, prior diagnosis, and questions you need answered.',
  },
  Presentation: {
    examples: ['Slides', 'Outline', 'Speaker notes', 'Audience notes', 'Research'],
    looksFor: ['Flow', 'Weak points', 'Likely questions', 'Timing', 'Close'],
    steering: [
      { phrase: 'Let me frame this.', meaning: 'Reset audience attention' },
      { phrase: 'The point is...', meaning: 'Compress message' },
      { phrase: 'Here’s the evidence.', meaning: 'Support claim' },
      { phrase: 'Let’s bring it back.', meaning: 'Recover flow' },
    ],
    prompt: 'Give GEORGE your audience, message, weak sections, time limit, likely questions, and desired close.',
  },
  'Everyday Conversation': {
    examples: ['Text thread', 'Situation notes', 'Relationship context', 'Goal', 'Concerns'],
    looksFor: ['Tone', 'Timing', 'Trust', 'Misunderstanding', 'Best next words'],
    steering: [
      { phrase: 'I hear you.', meaning: 'Acknowledge before redirecting' },
      { phrase: 'Let me say that better.', meaning: 'Reword softer' },
      { phrase: 'That’s not what I meant.', meaning: 'Repair misunderstanding' },
      { phrase: 'Give me a second.', meaning: 'Buy time' },
    ],
    prompt: 'Give GEORGE the relationship, what happened, what you want, what could go wrong, and your preferred tone.',
  },
  Other: {
    examples: ['Notes', 'Screenshots', 'Messages', 'Documents', 'Context'],
    looksFor: ['Signals', 'Risks', 'Goals', 'Constraints', 'Next move'],
    steering: [
      { phrase: 'One second.', meaning: 'Buy time' },
      { phrase: 'Right.', meaning: 'Continue' },
      { phrase: 'Let me reframe.', meaning: 'Change angle' },
      { phrase: 'What matters is...', meaning: 'Focus outcome' },
    ],
    prompt: 'Give GEORGE the room, people involved, desired outcome, pressure, and what must not be missed.',
  },
}

function normalizeChair(value: string | null | undefined): ChairKey {
  const clean = String(value || '').trim()
  if (clean === 'Sales') return 'Sales Call'
  if (clean === 'Doctor') return 'Doctor Appointment'
  if (clean in chairProfiles) return clean as ChairKey
  return 'Other'
}

export default function DeployLivePage() {
  const [chair, setChair] = useState<ChairKey>('Interview')
  const [customChair, setCustomChair] = useState('')
  const [objective, setObjective] = useState('')
  const [knownContext, setKnownContext] = useState('')
  const [signals, setSignals] = useState(chairProfiles.Interview.steering)
  const [estimatedLiveCents, setEstimatedLiveCents] = useState<number | null>(null)

  const profile = chairProfiles[chair]
  const chairLabel = chair === 'Other' && customChair.trim() ? customChair.trim() : chair

  useEffect(() => {
    try {
      const setup = JSON.parse(window.localStorage.getItem('GEORGE_LIVE_SETUP') || window.localStorage.getItem('GEORGE_LAST_LIVE_SETUP') || 'null')
      const nextChair = normalizeChair(setup?.room)
      setChair(nextChair)
      setObjective(setup?.objective || '')
      setKnownContext(setup?.knownContext || '')
      setSignals(chairProfiles[nextChair].steering)

      const savedCents = Number(window.localStorage.getItem('george_live_estimated_cents') || '')
      if (Number.isFinite(savedCents) && savedCents > 0) {
        setEstimatedLiveCents(savedCents)
      }

      if (nextChair === 'Other' && setup?.room) setCustomChair(setup.room)
    } catch {}
  }, [])

  useEffect(() => {
    setSignals(chairProfiles[chair].steering)
  }, [chair])

  const saveAndReturn = () => {
    try {
      const existing = JSON.parse(window.localStorage.getItem('GEORGE_LIVE_SETUP') || '{}')
      const next = {
        ...existing,
        room: chairLabel,
        objective,
        knownContext,
        deployLiveSignals: {
          chair: chairLabel,
          examples: profile.examples,
          looksFor: profile.looksFor,
          steering: signals,
          prompt: profile.prompt,
        },
        updatedAt: Date.now(),
      }

      window.localStorage.setItem('GEORGE_LIVE_SETUP', JSON.stringify(next))
      window.localStorage.setItem('GEORGE_LAST_LIVE_SETUP', JSON.stringify(next))
      window.localStorage.setItem('george_live_steering_signals', JSON.stringify(signals))
    } catch {}

    window.location.href = '/george/live-entry'
  }

  return (
    <main className="min-h-screen bg-[#050506] px-4 py-7 text-white">
      <section className="mx-auto max-w-[680px]">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.26em] text-white/28">More Signal</p>
          <Link href="/george/live-entry" className="text-[11px] uppercase tracking-[0.18em] text-white/42">
            Back
          </Link>
        </div>

        <h1 className="mt-6 text-[32px] font-semibold leading-[1.0] tracking-[-0.045em] text-white/92 md:text-[42px]">
          Strengthen GEORGE.
        </h1>

        <p className="mt-3 text-[13px] leading-6 text-white/46">
          A few strong signals help GEORGE move toward your desired outcome.
        </p>

        <div className="mt-5 rounded-[1rem] border border-white/[0.07] bg-white/[0.025] p-3">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/28">Conversation Type</span>
            <select
              value={chair}
              onChange={(event) => setChair(event.target.value as ChairKey)}
              className="mt-2 w-full rounded-[0.75rem] border border-white/[0.07] bg-black/40 px-3 py-3 text-[14px] text-white outline-none"
            >
              {Object.keys(chairProfiles).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          {chair === 'Other' && (
            <input
              value={customChair}
              onChange={(event) => setCustomChair(event.target.value)}
              placeholder="Name this conversation type"
              className="mt-2 w-full rounded-[0.75rem] border border-white/[0.07] bg-black/30 px-3 py-3 text-[14px] text-white outline-none placeholder:text-white/24"
            />
          )}
        </div>

        <div className="mt-4 rounded-[1rem] border border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.045] p-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#D7DCFF]/38">Signals That Help</p>

          <p className="mt-3 text-[12px] uppercase tracking-[0.18em] text-white/28">Examples</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.examples.map((item) => (
              <span key={item} className="rounded-full border border-white/[0.055] bg-black/20 px-2.5 py-1 text-[11px] text-white/48">
                {item}
              </span>
            ))}
          </div>

          <p className="mt-4 text-[12px] uppercase tracking-[0.18em] text-white/28">GEORGE will pay attention to</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.looksFor.map((item) => (
              <span key={item} className="rounded-full bg-white/[0.055] px-2.5 py-1 text-[11px] text-white/48">
                {item}
              </span>
            ))}
          </div>
        </div>

        <label className="mt-4 block rounded-[1rem] border border-white/[0.055] bg-black/18 p-3">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/28">Desired Outcome</span>
          <textarea
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            rows={2}
            placeholder="What are you trying to make happen?"
            className="mt-2 w-full resize-none bg-transparent text-[14px] leading-5 text-white/72 outline-none placeholder:text-white/24"
          />
        </label>

        <label className="mt-3 block rounded-[1rem] border border-white/[0.055] bg-black/18 p-3">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/28">What is happening?</span>
          <textarea
            value={knownContext}
            onChange={(event) => setKnownContext(event.target.value)}
            rows={4}
            placeholder={profile.prompt}
            className="mt-2 w-full resize-none bg-transparent text-[14px] leading-5 text-white/72 outline-none placeholder:text-white/24"
          />
        </label>

        {estimatedLiveCents !== null && (
          <div className="mt-3 rounded-[1rem] border border-[#8FB6C9]/[0.10] bg-[#8FB6C9]/[0.035] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DCFF]/34">Estimated LIVE cost</div>
            <div className="mt-1 flex items-end justify-between gap-3">
              <div>
                <div className="text-[24px] font-semibold tracking-[-0.05em] text-white/90">{estimatedLiveCents}¢</div>
                <div className="mt-1 text-[12px] text-white/44">Typical 30-minute LIVE session</div>
              </div>
              <div className="text-right text-[11px] leading-4 text-white/34">
                Updates when more signal or resources are added.
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
              <div
                className="h-full rounded-full bg-[#8FB6C9]/55 transition-[width] duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(12, estimatedLiveCents * 2))}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 rounded-[1rem] border border-white/[0.055] bg-white/[0.02] p-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/28">Steering Signals</p>
          <div className="mt-3 grid gap-2">
            {signals.map((signal, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr] gap-2">
                <input
                  value={signal.phrase}
                  onChange={(event) => {
                    const next = signals.map((item, i) => i === index ? { ...item, phrase: event.target.value } : item)
                    setSignals(next)
                  }}
                  className="rounded-[0.7rem] border border-white/[0.06] bg-black/26 px-3 py-2 text-[12px] text-white/70 outline-none"
                />
                <input
                  value={signal.meaning}
                  onChange={(event) => {
                    const next = signals.map((item, i) => i === index ? { ...item, meaning: event.target.value } : item)
                    setSignals(next)
                  }}
                  className="rounded-[0.7rem] border border-white/[0.06] bg-black/26 px-3 py-2 text-[12px] text-white/70 outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={saveAndReturn}
          className="mt-5 w-full rounded-[0.9rem] border border-[#8FB6C9]/[0.18] bg-[#8FB6C9]/[0.10] px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#D7DCFF]/82"
        >
          Save Signals
        </button>
      </section>
    </main>
  )
}
