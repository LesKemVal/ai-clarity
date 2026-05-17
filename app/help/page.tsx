'use client'

import { useState } from 'react'

type HelpSection =
  | 'george'
  | 'live'
  | 'continuity'
  | 'memory'
  | 'images'
  | 'voice'
  | 'signal'
  | null

export default function HelpPage() {
  const [open, setOpen] = useState<HelpSection>(null)

  const toggle = (section: HelpSection) => {
    setOpen(open === section ? null : section)
  }

  return (
    <main className="min-h-[100dvh] bg-[#06070A] px-5 py-10 text-white">
      <div className="mx-auto max-w-[720px]">
        <div className="mb-10">
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/34">
            OPERATIONAL HELP
          </div>

          <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.05em] text-white/92">
            GEORGE works like a utility.
          </h1>

          <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-white/58">
            Use what you need. Ignore what you do not. GEORGE is designed to
            help people think, prepare, communicate, and move more effectively
            in real situations.
          </p>
        </div>

        <div className="space-y-3">
          <UtilityCard
            open={open === 'george'}
            onClick={() => toggle('george')}
            label="GEORGE"
            title="Normal GEORGE"
            body="Use GEORGE to think through problems, build plans, interpret documents, prepare for decisions, sharpen ideas, or continue momentum when direction matters."
          />

          <UtilityCard
            open={open === 'live'}
            onClick={() => toggle('live')}
            label="LIVE"
            title="LIVE Conversation"
            body="LIVE helps during conversations where timing, pressure, and communication matter. Interviews, meetings, negotiations, conflict, presentations, calls, and difficult moments."
            accent
          />

          <UtilityCard
            open={open === 'continuity'}
            onClick={() => toggle('continuity')}
            label="CONTINUITY"
            title="Continuity"
            body="GEORGE can restore sessions, context, goals, and ongoing work so conversations continue naturally instead of restarting from zero."
          />

          <UtilityCard
            open={open === 'memory'}
            onClick={() => toggle('memory')}
            label="MEMORY"
            title="Memory & Sessions"
            body="Sessions help GEORGE continue useful work over time. Important conversations, goals, and operational context can persist across usage."
          />

          <UtilityCard
            open={open === 'images'}
            onClick={() => toggle('images')}
            label="IMAGES"
            title="Images & Documents"
            body="You can show GEORGE screenshots, photos, and documents to add context, interpret information, or support LIVE situations."
          />

          <UtilityCard
            open={open === 'voice'}
            onClick={() => toggle('voice')}
            label="VOICE"
            title="Voice"
            body="Voice and earbud support are designed for real-world usage where hands-free assistance, timing, and low-friction interaction matter."
          />

          <UtilityCard
            open={open === 'signal'}
            onClick={() => toggle('signal')}
            label="SIGNAL"
            title="Signal"
            body="Signal helps GEORGE interpret what matters most in the room: pressure, timing, leverage, hesitation, confusion, urgency, and momentum."
          />
        </div>
      </div>
    </main>
  )
}

function UtilityCard({
  open,
  onClick,
  label,
  title,
  body,
  accent = false,
}: {
  open: boolean
  onClick: () => void
  label: string
  title: string
  body: string
  accent?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[1.1rem] border px-5 py-4 text-left transition-all duration-300 ${
        accent
          ? 'border-[#8FB6C9]/[0.14] bg-[#8FB6C9]/[0.035]'
          : 'border-white/[0.05] bg-black/[0.18]'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/34">
            {label}
          </div>

          <div className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-white/88">
            {title}
          </div>
        </div>

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] text-[18px] text-white/42 transition ${
            open ? 'rotate-45 bg-white/[0.06] text-white/84' : ''
          }`}
        >
          +
        </div>
      </div>

      <div
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open
            ? 'mt-4 grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-[14px] leading-6 text-white/58">
            {body}
          </p>
        </div>
      </div>
    </button>
  )
}
