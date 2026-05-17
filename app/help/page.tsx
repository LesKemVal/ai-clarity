'use client'

import { useState } from 'react'

type HelpSection =
  | 'george'
  | 'live'
  | 'continuity'
  | 'signal'
  | 'context'
  | 'voice'
  | null

const HELP_ITEMS: Array<{
  id: Exclude<HelpSection, null>
  index: string
  label: string
  title: string
  body: string
  utility: string
  accent?: boolean
}> = [
  {
    id: 'george',
    index: '01',
    label: 'GEORGE',
    title: 'Direction and action.',
    body: 'Use GEORGE to clarify the situation, narrow the strongest next move, work through documents, decisions, plans, and pressure.',
    utility: 'Ask. Decide. Move.',
  },
  {
    id: 'live',
    index: '02',
    label: 'LIVE',
    title: 'Timing under pressure.',
    body: 'Use LIVE when the conversation is the work: interviews, negotiations, calls, meetings, presentations, conflict, or moments where words matter.',
    utility: 'Timing. Pressure. Execution.',
    accent: true,
  },
  {
    id: 'continuity',
    index: '03',
    label: 'CONTINUITY',
    title: 'Return without restarting.',
    body: 'GEORGE can preserve sessions, goals, and working context so useful work continues instead of beginning from zero every time.',
    utility: 'Remember the work.',
  },
  {
    id: 'signal',
    index: '04',
    label: 'SIGNAL',
    title: 'What matters in the room.',
    body: 'Signal helps GEORGE track pressure, hesitation, timing, leverage, confusion, and momentum so guidance stays useful instead of generic.',
    utility: 'Read what changes.',
  },
  {
    id: 'context',
    index: '05',
    label: 'CONTEXT',
    title: 'Show GEORGE what matters.',
    body: 'Use documents, screenshots, images, room setup, and user-provided details to give GEORGE better operating context.',
    utility: 'Give GEORGE context.',
  },
  {
    id: 'voice',
    index: '06',
    label: 'VOICE',
    title: 'Hands-free utility.',
    body: 'Voice and earbud support are for moments where low-friction help, timing, and short cues matter more than long explanations.',
    utility: 'Useful when moving.',
  },
]

export default function HelpPage() {
  const [open, setOpen] = useState<HelpSection>('george')
  const active = HELP_ITEMS.find((item) => item.id === open) || HELP_ITEMS[0]

  return (
    <main className="min-h-[100dvh] bg-[#06070A] px-5 py-8 text-[#D7DBE4]">
      <div className="mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-[920px] flex-col justify-center">
        <section className="mb-7 max-w-[660px]">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#8D949F]">
            OPERATIONAL HELP
          </div>

          <h1 className="mt-3 text-[31px] font-semibold tracking-[-0.05em] text-[#DADFE8] sm:text-[38px]">
            Utility, not feature list.
          </h1>

          <p className="mt-3 max-w-[560px] text-[14px] leading-6 text-[#8F96A3]">
            GEORGE is built for direction, preparation, conversation, and continuity. Open only what you need.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-[0.92fr_1.08fr] md:items-start">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2">
            {HELP_ITEMS.map((item) => {
              const selected = item.id === open

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOpen(selected ? null : item.id)}
                  className={`min-h-[82px] rounded-[0.82rem] border px-3 py-3 text-left transition-all duration-200 ${
                    selected
                      ? item.accent
                        ? 'border-[#8FB6C9]/[0.24] bg-[#8FB6C9]/[0.060] text-[#E0EDF4] shadow-[0_14px_36px_rgba(4,10,18,0.28)]'
                        : 'border-white/[0.105] bg-white/[0.032] text-[#E2E5EA] shadow-[0_14px_34px_rgba(0,0,0,0.22)]'
                      : 'border-white/[0.045] bg-black/[0.16] text-[#8F96A3] hover:border-white/[0.085] hover:bg-white/[0.018] hover:text-[#C8CDD6]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] tracking-[0.18em] text-current/42">{item.index}</span>
                    <span className="text-[12px] text-current/35">{selected ? '—' : '+'}</span>
                  </div>

                  <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-current/58">
                    {item.label}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="min-h-[268px] rounded-[1rem] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.008))] px-5 py-5 text-left shadow-[0_18px_46px_rgba(0,0,0,0.24)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.045] pb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#7F8794]">
                  {active.index} — {active.label}
                </div>

                <h2 className="mt-3 text-[25px] font-semibold tracking-[-0.045em] text-[#DDE2EA]">
                  {active.title}
                </h2>
              </div>

              <div className={`mt-1 h-2 w-2 rounded-full ${active.accent ? 'bg-[#8FB6C9]/70' : 'bg-[#A7ADB8]/50'}`} />
            </div>

            <p className="mt-5 text-[15px] leading-7 text-[#A3AAB5]">
              {active.body}
            </p>

            <div className="mt-6 rounded-[0.85rem] border border-white/[0.04] bg-black/[0.20] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#777F8B]">
                Utility
              </div>

              <div className="mt-2 text-[14px] font-medium text-[#C9CED8]">
                {active.utility}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
