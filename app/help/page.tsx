'use client'

import { useState } from 'react'
import BxPageHeader from '@/components/BxPageHeader'

type HelpSection =
  | 'george'
  | 'live'
  | 'room'
  | 'signal'
  | 'continuity'
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
    label: 'PLAN',
    title: 'Plan with GEORGE.',
    body: 'Build strategies, business plans, presentations, interview preparation, negotiation plans, project plans, or clear next steps. Start by describing the outcome you want to achieve.',
    utility: 'Plans. Strategies. Roadmaps. Interviews. Meetings.',
    accent: true,
  },
  {
    id: 'signal',
    index: '02',
    label: 'ANALYZE',
    title: 'Analyze what matters.',
    body: 'Review documents, contracts, opportunities, reports, and ideas. Compare options, identify risks, summarize information, and understand unfamiliar topics before making decisions.',
    utility: 'Documents. Contracts. Opportunities. Decisions.',
  },
  {
    id: 'room',
    index: '03',
    label: 'CREATE',
    title: 'Create better work.',
    body: 'Draft pitch decks, proposals, presentations, emails, business plans, responses, and other work products that help move your objective forward.',
    utility: 'Pitch decks. Presentations. Proposals. Writing.',
  },
  {
    id: 'continuity',
    index: '04',
    label: 'DECIDE',
    title: 'Make better decisions.',
    body: 'Ask GEORGE to compare approaches, weigh tradeoffs, evaluate risks, and recommend practical next steps while keeping your desired outcome in view.',
    utility: 'Compare. Decide. Recommend.',
  },
  {
    id: 'voice',
    index: '05',
    label: 'PRACTICE',
    title: 'Practice before the room.',
    body: 'Rehearse interviews, presentations, negotiations, objections, difficult conversations, or important questions before they happen.',
    utility: 'Rehearse. Refine. Improve.',
  },
  {
    id: 'live',
    index: '06',
    label: 'LIVE',
    title: 'Continue into LIVE.',
    body: 'When GEORGE recognizes that execution is approaching, it may recommend LIVE support. If you continue, GEORGE stays with you while the conversation unfolds, adapting to changing signals and supporting your desired outcome.',
    utility: 'Prepare. Continue. Perform.',
  },
]


export default function HelpPage() {
  const [open, setOpen] = useState<HelpSection>('george')
  const active = HELP_ITEMS.find((item) => item.id === open) || HELP_ITEMS[0]

  return (
    <main className="min-h-[100dvh] bg-black px-4 py-5 text-[#D7DBE4] sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-40px)] w-full max-w-[1080px] flex-col">
        <BxPageHeader backLabel="GEORGE" />

        <section className="mb-10 grid gap-6 border-b border-white/10 pb-9 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.32em] text-white/34">
              Operational Help
            </div>

            <h1 className="mt-4 max-w-3xl font-mono text-[42px] font-black uppercase leading-[0.9] tracking-[-0.075em] text-white md:text-[72px]">
              HELP
            </h1>

            <div className="mt-6 font-mono text-[17px] font-semibold uppercase leading-[1.05] tracking-[0.12em] text-[#8FB6C9]/82 md:text-[28px]">
              Understand what GEORGE can help you accomplish.
            </div>
          </div>

          <p className="max-w-2xl self-end text-[17px] leading-8 text-white/62 md:text-[20px]">
            Plan, prepare, review, decide, and move toward your desired outcome with clearer judgment and better communication.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-[0.82fr_1.18fr] md:items-start">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-1">
            {HELP_ITEMS.map((item) => {
              const selected = item.id === open

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOpen(selected ? null : item.id)}
                  className={`min-h-[74px] rounded-[18px] px-4 py-4 text-left transition-all duration-200 active:scale-[0.985] ${
                    selected
                      ? 'bg-[#0D1118] text-white shadow-[0_22px_70px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.08]'
                      : 'bg-[#05060A] text-white/42 ring-1 ring-white/[0.045] hover:bg-[#080A0F] hover:text-white/72'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] tracking-[0.16em] text-current/54">{item.index}</span>
                    <span className="text-[12px] text-current/48">{selected ? '—' : '+'}</span>
                  </div>

                  <div className="mt-3 font-mono text-[12px] uppercase tracking-[0.16em] text-current/76">
                    {item.label}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="min-h-[360px] rounded-[28px] bg-[#05060A] px-6 py-6 text-left shadow-[0_28px_90px_rgba(0,0,0,0.48)] ring-1 ring-white/[0.055] md:px-8 md:py-8">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">
                  {active.index} — {active.label}
                </div>

                <h2 className="mt-4 font-mono text-[30px] font-black uppercase leading-[0.96] tracking-[-0.055em] text-white md:text-[44px]">
                  {active.title}
                </h2>
              </div>

              <div className={`mt-1 h-2 w-2 rounded-full ${active.accent ? 'bg-[#8FB6C9]/58' : 'bg-white/32'}`} />
            </div>

            <p className="mt-7 max-w-2xl text-[19px] leading-8 text-white/62">
              {active.body}
            </p>

            <div className="mt-8 rounded-[20px] bg-[#0B0D12] px-5 py-4 ring-1 ring-white/[0.045]">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
                Utility
              </div>

              <div className="mt-2 text-[15px] font-medium text-white/72">
                {active.utility}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
