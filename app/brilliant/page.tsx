'use client'

import { useState } from 'react'
import PageShell from '@/components/layout/PageShell'

const wakeOptions = [
  { id: 'double-tap', label: 'Double tap earbud', note: 'Wake GEORGE with a quick double tap.' },
  { id: 'long-press', label: 'Long press earbud', note: 'Wake GEORGE and reuse last mode.' },
  { id: 'voice', label: 'Voice phrase', note: 'Use a wake phrase like “George”.' },
  { id: 'app-tap', label: 'Silent app tap', note: 'Wake GEORGE without speaking.' },
]

const modeOptions = [
  { id: 'everyday', label: 'Everyday', note: 'Natural help for fast-moving normal conversation.' },
  { id: 'defensive', label: 'Defensive', note: 'Protect dignity, regain frame, reduce damage.' },
  { id: 'negotiation', label: 'Negotiation', note: 'Protect leverage, avoid weak concessions, control terms.' },
  { id: 'interview', label: 'Interview', note: 'Stay composed, answer clearly, recover quickly.' },
  { id: 'relationship', label: 'Relationship', note: 'Say what matters without sounding weak or rambling.' },
  { id: 'leadership', label: 'Leadership', note: 'Stronger authority, calm direction, cleaner room control.' },
]

const responseOptions = [
  { id: 'ask-only', label: 'Ask only', note: 'GEORGE speaks only when you ask.' },
  { id: 'pause-assist', label: 'Pause assist', note: 'GEORGE helps when you pause and need a line.' },
  { id: 'risk-protect', label: 'Risk protect', note: 'GEORGE steps in if your objective is slipping.' },
  { id: 'openings-only', label: 'Openings only', note: 'GEORGE speaks only in clean response windows.' },
  { id: 'manual-only', label: 'Manual only', note: 'No automatic speaking. Trigger every response yourself.' },
]

const humanAssistOptions = [
  { id: 'off', label: 'Off', note: 'GEORGE only.' },
  { id: 'listen-only', label: 'Trusted Ear listen only', note: 'Trusted human listens but does not coach.' },
  { id: 'coach', label: 'Trusted Ear coach', note: 'Trusted human can coach quietly into your ear.' },
  { id: 'dual', label: 'GEORGE + Human', note: 'Use GEORGE and a trusted human together.' },
]

function ChoiceCard({
  active,
  title,
  note,
  onClick,
}: {
  active: boolean
  title: string
  note: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[1.05rem] border p-4 text-left transition ${
        active
          ? 'border-[#7C8CFF]/60 bg-[#7C8CFF]/[0.055] shadow-[0_0_14px_rgba(124,140,255,0.08)]'
          : 'border-white/10 bg-white/[0.018] hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-neutral-300">{note}</p>
        </div>
        <span
          className={`mt-1 h-3 w-3 rounded-full ${
            active ? 'bg-[#7C8CFF]' : 'bg-white/20'
          }`}
        />
      </div>
    </button>
  )
}

export default function BrilliantPage() {
  const [wake, setWake] = useState('double-tap')
  const [mode, setMode] = useState('negotiation')
  const [response, setResponse] = useState('ask-only')
  const [assist, setAssist] = useState('off')
  const [triggerPhrase, setTriggerPhrase] = useState('George')
  const [modePhrase, setModePhrase] = useState('negotiation')
  const [saveSummaries, setSaveSummaries] = useState(true)
  const [saveCoachingNotes, setSaveCoachingNotes] = useState(true)

  return (
    <PageShell title="Brilliant" eyebrow="Conversation Engine" backToGeorge withSidebar={false}>
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[1.05rem] border border-white/[0.045] bg-black shadow-none">
          <div className="grid gap-8 px-6 py-10 md:px-8 md:py-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#7C8CFF]">
                BRANESx Brilliant
              </p>

              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Keep control of your own conversation.
                </h1>

                <p className="text-xl font-medium tracking-tight text-[#d7dcff] md:text-2xl">
                  Command the room when it matters.
                </p>
              </div>

              <p className="max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
                You decide when GEORGE wakes—and when GEORGE speaks.
              </p>

              <p className="max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
                Conversation Engine is for real moments. Interviews. Negotiations. Workplace pressure.
                Relationship talks. Fast-moving situations where timing, tone, and wording matter.
              </p>

              <div className="rounded-[1rem] border border-[#7C8CFF]/30 bg-[#7C8CFF]/[0.055] px-4 py-3 text-sm leading-7 text-white/90">
                Conversations are analyzed live to help you. Raw audio is not stored by default or sent outside you and your invited party.
              </div>
            </div>

            <div className="rounded-[1.05rem] border border-white/[0.05] bg-white/[0.018] p-5 shadow-[0_0_40px_rgba(124,140,255,0.08)]">
              <div className="space-y-4">
                <p className="text-sm font-medium text-white">Live session summary</p>

                <div className="space-y-3 text-sm">
                  <div className="rounded-[1rem] border border-white/[0.05] bg-black/30 px-4 py-3">
                    <p className="text-white">Wake</p>
                    <p className="mt-1 text-neutral-300">
                      {wakeOptions.find((o) => o.id === wake)?.label}
                    </p>
                  </div>

                  <div className="rounded-[1rem] border border-white/[0.05] bg-black/30 px-4 py-3">
                    <p className="text-white">Mode</p>
                    <p className="mt-1 text-neutral-300">
                      {modeOptions.find((o) => o.id === mode)?.label}
                    </p>
                  </div>

                  <div className="rounded-[1rem] border border-white/[0.05] bg-black/30 px-4 py-3">
                    <p className="text-white">Response</p>
                    <p className="mt-1 text-neutral-300">
                      {responseOptions.find((o) => o.id === response)?.label}
                    </p>
                  </div>

                  <div className="rounded-[1rem] border border-white/[0.05] bg-black/30 px-4 py-3">
                    <p className="text-white">Human assist</p>
                    <p className="mt-1 text-neutral-300">
                      {humanAssistOptions.find((o) => o.id === assist)?.label}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full rounded-full bg-[#7C8CFF] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  Start Brilliant Session
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.2rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#7C8CFF]">Wake trigger</p>
              <div className="grid gap-3">
                {wakeOptions.map((option) => (
                  <ChoiceCard
                    key={option.id}
                    active={wake === option.id}
                    title={option.label}
                    note={option.note}
                    onClick={() => setWake(option.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#7C8CFF]">Mode trigger</p>
              <div className="grid gap-3">
                {modeOptions.map((option) => (
                  <ChoiceCard
                    key={option.id}
                    active={mode === option.id}
                    title={option.label}
                    note={option.note}
                    onClick={() => setMode(option.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.2rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#7C8CFF]">Response trigger</p>
              <div className="grid gap-3">
                {responseOptions.map((option) => (
                  <ChoiceCard
                    key={option.id}
                    active={response === option.id}
                    title={option.label}
                    note={option.note}
                    onClick={() => setResponse(option.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#7C8CFF]">Human assist</p>
              <div className="grid gap-3">
                {humanAssistOptions.map((option) => (
                  <ChoiceCard
                    key={option.id}
                    active={assist === option.id}
                    title={option.label}
                    note={option.note}
                    onClick={() => setAssist(option.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.2rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#7C8CFF]">Phrases</p>

              <div className="space-y-2">
                <label className="text-sm text-white">Wake phrase</label>
                <input
                  value={triggerPhrase}
                  onChange={(e) => setTriggerPhrase(e.target.value)}
                  placeholder="George"
                  className="w-full rounded-[1rem] border border-white/[0.05] bg-[#171B26]/58 px-4 py-3 text-white outline-none placeholder:text-white/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white">Mode phrase</label>
                <input
                  value={modePhrase}
                  onChange={(e) => setModePhrase(e.target.value)}
                  placeholder="negotiation"
                  className="w-full rounded-[1rem] border border-white/[0.05] bg-[#171B26]/58 px-4 py-3 text-white outline-none placeholder:text-white/30"
                />
              </div>

              <div className="rounded-[1rem] border border-white/[0.05] bg-white/[0.018] px-4 py-3 text-sm leading-7 text-neutral-300">
                Example: double tap earbud, then whisper <span className="text-white">“{modePhrase || 'negotiation'}”</span>.
              </div>
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#7C8CFF]">Privacy</p>

              <label className="flex items-center justify-between rounded-[1rem] border border-white/[0.05] bg-white/[0.018] px-4 py-3">
                <span className="text-sm text-white">Save summaries only</span>
                <input
                  type="checkbox"
                  checked={saveSummaries}
                  onChange={(e) => setSaveSummaries(e.target.checked)}
                  className="h-4 w-4 accent-[#7C8CFF]"
                />
              </label>

              <label className="flex items-center justify-between rounded-[1rem] border border-white/[0.05] bg-white/[0.018] px-4 py-3">
                <span className="text-sm text-white">Save coaching notes only</span>
                <input
                  type="checkbox"
                  checked={saveCoachingNotes}
                  onChange={(e) => setSaveCoachingNotes(e.target.checked)}
                  className="h-4 w-4 accent-[#7C8CFF]"
                />
              </label>

              <div className="rounded-[1rem] border border-white/[0.05] bg-black/30 px-4 py-3 text-sm leading-7 text-neutral-300">
                GEORGE stays available but dormant until you wake it. The user owns the floor.
              </div>

              <button
                type="button"
                className="w-full rounded-full border border-white/[0.05] px-5 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-[#7C8CFF]"
              >
                Delete session now
              </button>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
