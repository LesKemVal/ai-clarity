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
    label: 'START',
    title: 'Give GEORGE the outcome.',
    body: 'Tell GEORGE what you are trying to do: get the job, prepare for a meeting, explain an idea, negotiate, study, decide, or handle pressure. GEORGE works best when he knows what success should look like.',
    utility: 'Start with the result you want.',
    accent: true,
  },
  {
    id: 'signal',
    index: '02',
    label: 'SIGNAL',
    title: 'Give GEORGE useful material.',
    body: 'Upload or snap pictures of what matters: a job ad, résumé, offer, agenda, email, deck, notes, screenshots, contract, medical question, or anything else that explains the room. More signal gives GEORGE better judgment.',
    utility: 'Documents, screenshots, photos, notes, and goals.',
  },
  {
    id: 'live',
    index: '03',
    label: 'LIVE',
    title: 'Move from prep to the room.',
    body: 'After GEORGE understands the situation, you can bring him into LIVE. For example, upload a job ad and résumé, prepare the likely questions, then use LIVE for interview support if that is what you want to do.',
    utility: 'Prepare first. Go LIVE when the room matters.',
  },
  {
    id: 'room',
    index: '04',
    label: 'SUPPORT',
    title: 'Choose how much help you want.',
    body: 'GEORGE can give a cue, a line, a response, a presentation, a continuation, or silence. Cue is the default. You can override GEORGE before LIVE starts or while the room is active.',
    utility: 'Cue. Line. Response. Presentation. Continue.',
  },
  {
    id: 'voice',
    index: '05',
    label: 'STEERING',
    title: 'Use natural phrases to steer GEORGE.',
    body: 'Advanced users can attach phrases to actions. A phrase can soften tone, make GEORGE more direct, ask for a line, request a fuller answer, buy time, or shift support without opening settings.',
    utility: 'Natural language controls for real rooms.',
  },
  {
    id: 'continuity',
    index: '06',
    label: 'CONTROL',
    title: 'You remain responsible.',
    body: 'GEORGE supports judgment; GEORGE does not replace it. You decide what to accept, change, ignore, or say. Sign in when you want GEORGE to preserve work and restore useful context later.',
    utility: 'You decide. GEORGE supports.',
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

            <h1 className="mt-4 max-w-2xl font-serif text-[42px] leading-[0.98] tracking-[-0.06em] text-white md:text-[64px]">
              Use GEORGE by giving him the room.
            </h1>
          </div>

          <p className="max-w-2xl self-end text-[18px] leading-8 text-white/62 md:text-[21px]">
            Upload the material that matters, set the outcome, then bring GEORGE into moments where timing, pressure, language, and delivery affect what happens next.
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

                <h2 className="mt-4 font-serif text-[34px] leading-[1.02] tracking-[-0.055em] text-white md:text-[48px]">
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
