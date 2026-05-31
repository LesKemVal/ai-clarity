'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const chairSignals = {
  Interview: {
    examples: ['Resume', 'Job description', 'Portfolio', 'Certifications', 'Interview notes'],
    value: ['Experience', 'Achievements', 'Credibility', 'Likely questions', 'Skill gaps'],
  },
  Boardroom: {
    examples: ['Board packet', 'Forecast', 'KPIs', 'Financial report', 'Meeting notes'],
    value: ['Numbers', 'Risks', 'Assumptions', 'Stakeholders', 'Decision history'],
  },
  Negotiation: {
    examples: ['Contract', 'Proposal', 'Term sheet', 'Pricing sheet', 'Email thread'],
    value: ['Leverage', 'Concessions', 'Deadlines', 'Terms', 'Objections'],
  },
  Sales: {
    examples: ['Sales script', 'Discovery notes', 'CRM notes', 'Proposal', 'Competitor comparison'],
    value: ['Pain points', 'Objections', 'Buying signals', 'Decision makers', 'Next step'],
  },
  Doctor: {
    examples: ['Medical notes', 'Lab results', 'Medication list', 'Symptoms', 'Referral notes'],
    value: ['History', 'Symptoms', 'Questions', 'Concerns', 'Treatment context'],
  },
  Presentation: {
    examples: ['Slides', 'Speaker notes', 'Research', 'Agenda', 'Audience notes'],
    value: ['Key points', 'Weak areas', 'Likely questions', 'Supporting evidence', 'Timing'],
  },
  Other: {
    examples: ['Notes', 'Screenshots', 'Images', 'Messages', 'Documents'],
    value: ['Context', 'Signals', 'Risks', 'Goals', 'Next move'],
  },
}

const defaultSteeringSignals = [
  { phrase: 'One second...', meaning: 'Buy time' },
  { phrase: 'Right...', meaning: 'Continue' },
  { phrase: 'Interesting...', meaning: 'Reframe' },
  { phrase: 'Repeat signal', meaning: 'Repair context' },
]

export default function DeployLivePage() {
  const [selectedChair, setSelectedChair] = useState<keyof typeof chairSignals>('Interview')
  const [customChair, setCustomChair] = useState('')
  const [steeringSignals, setSteeringSignals] = useState(defaultSteeringSignals)

  const chairLabel = selectedChair === 'Other' && customChair.trim()
    ? customChair.trim()
    : selectedChair

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('george_live_steering_signals')
      if (saved) setSteeringSignals(JSON.parse(saved))
    } catch {}
  }, [])

  function updateSteeringSignal(index: number, field: 'phrase' | 'meaning', value: string) {
    const next = steeringSignals.map((signal, i) =>
      i === index ? { ...signal, [field]: value } : signal
    )

    setSteeringSignals(next)

    try {
      window.localStorage.setItem('george_live_steering_signals', JSON.stringify(next))
    } catch {}
  }

  function resetSteeringSignals() {
    setSteeringSignals(defaultSteeringSignals)

    try {
      window.localStorage.setItem('george_live_steering_signals', JSON.stringify(defaultSteeringSignals))
    } catch {}
  }

  return (
    <main className="min-h-screen bg-[#050506] text-white px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7C8CFF]">Deploy LIVE</p>
          <Link href="/george/live" className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/70">
            Skip tutorial
          </Link>
        </div>

        <h1 className="mt-8 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
          Bring GEORGE up to speed.
        </h1>

        <p className="mt-6 max-w-2xl text-white/60 leading-7">
          Upload anything that contains relevant signals. GEORGE uses those signals to reduce explanation, improve timing, and support the room faster.
        </p>

        <div className="mt-10 rounded-2xl border border-[#7C8CFF]/25 bg-[#7C8CFF]/[0.06] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Give GEORGE better signal</p>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Upload documents, notes, screenshots, images, or anything else that helps GEORGE understand the room before pressure rises.
          </p>
          <button className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-black">
            Upload relevant signal
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">Current chair</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{chairLabel}</h2>
            </div>

            <select
              value={selectedChair}
              onChange={(event) => setSelectedChair(event.target.value as keyof typeof chairSignals)}
              className="rounded-full border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#7C8CFF]/60"
            >
              {Object.keys(chairSignals).map((chair) => (
                <option key={chair} value={chair}>
                  {chair}
                </option>
              ))}
            </select>
          </div>

          {selectedChair === 'Other' ? (
            <label className="mt-5 grid gap-2 text-xs uppercase tracking-[0.14em] text-white/35">
              Name this chair
              <input
                value={customChair}
                onChange={(event) => setCustomChair(event.target.value)}
                placeholder="Example: landlord call, court prep, investor update"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm normal-case tracking-normal text-white outline-none placeholder:text-white/25 focus:border-[#7C8CFF]/50"
              />
            </label>
          ) : null}

          <p className="mt-5 text-xs uppercase tracking-[0.18em] text-white/35">Upload examples</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {chairSignals[selectedChair].examples.map((item) => (
              <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/65">
                {item}
              </span>
            ))}
          </div>

          <p className="mt-5 text-xs uppercase tracking-[0.18em] text-white/35">GEORGE looks for</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {chairSignals[selectedChair].value.map((item) => (
              <span key={item} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/65">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-3 rounded-xl border border-[#7C8CFF]/20 bg-[#7C8CFF]/[0.055] p-4 text-sm leading-6 text-[#E8EAFF]/75">
            <p>
              This helps GEORGE support the {chairLabel} room with less explaining, faster timing, and better room awareness.
            </p>
            <p>
              Example: about 41 cents of LIVE support can help GEORGE stay with you through a focused {chairLabel.toLowerCase()} moment instead of leaving you to improvise alone.
            </p>
            <p>
              Scroll next to edit steering signals — the phrases GEORGE listens for while LIVE is active.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Sharpen with use</p>
            <p className="mt-3 text-sm leading-6 text-white/55">
              GEORGE improves as he learns your rooms, your preferred detail level, your steering phrases, and the kinds of pressure you face.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Practice first</p>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Use normal GEORGE to prepare, rehearse, and sharpen your thinking before you need LIVE in the room.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Normal + LIVE</p>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Normal GEORGE helps you think and prepare. LIVE GEORGE listens, adapts, and supports the next move while the conversation is happening.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Editable steering</p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Keep the defaults or change the phrases GEORGE should treat as steering signals.
              </p>
            </div>

            <button
              type="button"
              onClick={resetSteeringSignals}
              className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/60 hover:text-white"
            >
              Reset defaults
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            {steeringSignals.map((signal, index) => (
              <div key={index} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-3 sm:grid-cols-2">
                <label className="grid gap-2 text-xs uppercase tracking-[0.14em] text-white/35">
                  Phrase
                  <input
                    value={signal.phrase}
                    onChange={(event) => updateSteeringSignal(index, 'phrase', event.target.value)}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm normal-case tracking-normal text-white outline-none focus:border-[#7C8CFF]/50"
                  />
                </label>

                <label className="grid gap-2 text-xs uppercase tracking-[0.14em] text-white/35">
                  Meaning
                  <input
                    value={signal.meaning}
                    onChange={(event) => updateSteeringSignal(index, 'meaning', event.target.value)}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm normal-case tracking-normal text-white outline-none focus:border-[#7C8CFF]/50"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>


        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Before. During. After.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Before LIVE</p>
              <p className="mt-2 text-sm leading-6 text-white/55">Prepare. Practice. Upload signal.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">During LIVE</p>
              <p className="mt-2 text-sm leading-6 text-white/55">Listen. Adapt. Support. Respond. Upload signal if the room changes.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">After LIVE</p>
              <p className="mt-2 text-sm leading-6 text-white/55">Review. Improve. Sharpen. Learn.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#7C8CFF]/20 bg-[#7C8CFF]/[0.055] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Signal philosophy</p>
          <p className="mt-3 text-sm leading-6 text-[#E8EAFF]/75">
            GEORGE does not reject signals. GEORGE evaluates usefulness, timing, relevance, and context. A document, image, screenshot, note, or single sentence may become useful when the room changes.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/george/live" className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-black">
            LIVE Now
          </Link>
          <Link href="/george/live-entry" className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
            Back to Prep
          </Link>
        </div>
      </section>
    </main>
  )
}
