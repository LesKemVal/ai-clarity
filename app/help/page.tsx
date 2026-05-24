'use client'

import { useState } from 'react'
import BxPageHeader from '@/components/BxPageHeader'

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
    body: 'Use LIVE for interviews, negotiations, calls, meetings, presentations, conflict, or moments where words matter.',
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
    label: 'WHAT GEORGE NOTICES',
    title: 'Pressure, timing, and changes.',
    body: 'GEORGE watches for pressure, hesitation, confusion, timing, and changes in the room so support stays useful and practical.',
    utility: 'Notice what matters.',
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
    <main className="min-h-[100dvh] bg-[#06070A] px-4 py-5 text-[#D7DBE4] sm:px-5 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-40px)] w-full max-w-[920px] flex-col">
        <BxPageHeader backLabel="GEORGE" />

        <section className="mb-6 max-w-[660px]">
          <div className="text-[10px] uppercase tracking-[0.26em] text-white/28">
            OPERATIONAL HELP
          </div>

          <h1 className="mt-3 text-[31px] font-semibold leading-[0.98] tracking-[-0.05em] text-white/88 sm:text-[38px]">
            Utility, not feature list.
          </h1>

          <p className="mt-3 max-w-[560px] text-[14px] leading-6 text-white/44">
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
                  className={`min-h-[88px] rounded-[0.9rem] border px-4 py-4 text-left transition-all duration-200 ${
                    selected
                      ? item.accent
                        ? 'border-[#8FB6C9]/[0.18] bg-[#8FB6C9]/[0.045] text-[#E0EDF4] shadow-[0_12px_30px_rgba(4,10,18,0.22)]'
                        : 'border-white/[0.075] bg-white/[0.024] text-white/84 shadow-[0_12px_28px_rgba(0,0,0,0.18)]'
                      : 'border-white/[0.04] bg-black/[0.14] text-white/44 hover:border-white/[0.07] hover:bg-white/[0.014] hover:text-white/68'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] tracking-[0.16em] text-current/54">{item.index}</span>
                    <span className="text-[12px] text-current/48">{selected ? '—' : '+'}</span>
                  </div>

                  <div className="mt-3 text-[12px] uppercase tracking-[0.14em] text-current/70">
                    {item.label}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="min-h-[252px] rounded-[1rem] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.014),rgba(255,255,255,0.005))] px-5 py-5 text-left shadow-[0_14px_38px_rgba(0,0,0,0.20)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.035] pb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/30">
                  {active.index} — {active.label}
                </div>

                <h2 className="mt-3 text-[25px] font-semibold tracking-[-0.045em] text-white/84">
                  {active.title}
                </h2>
              </div>

              <div className={`mt-1 h-2 w-2 rounded-full ${active.accent ? 'bg-[#8FB6C9]/58' : 'bg-white/32'}`} />
            </div>

            <p className="mt-5 text-[15px] leading-7 text-white/50">
              {active.body}
            </p>

            <div className="mt-6 rounded-[0.85rem] border border-white/[0.035] bg-black/[0.18] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/28">
                Utility
              </div>

              <div className="mt-2 text-[14px] font-medium text-white/68">
                {active.utility}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
