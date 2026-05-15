'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getActiveSessionForMode } from '@/lib/george/session/store'

const ROOM_CONTROLS: Record<string, string[]> = {
  Interview: ['line', 'shorter', 'pause', 'answer clean'],
  Meeting: ['summarize', 'push back', 'pause', 'next question'],
  Boardroom: ['position', 'proof', 'slow down', 'next move'],
  Negotiation: ['line', 'hold firm', 'counter', 'pause'],
  'Sales Call': ['line', 'objection', 'close', 'shorter'],
  'Doctor Appointment': ['slow down', 'clarify', 'question', 'repeat'],
  Presentation: ['pace', 'stronger', 'simplify', 'close'],
  'Everyday Conversation': ['line', 'pause', 'shorter', 'help me respond'],
}

const ROOM_PROMPTS: Record<string, { label: string; placeholder: string }> = {
  Interview: {
    label: 'WHAT ARE THEY MOST LIKELY EVALUATING?',
    placeholder: 'Role, pressure points, what you want to communicate, or what concerns you most.'
  },

  Meeting: {
    label: 'WHAT NEEDS TO HAPPEN IN THIS ROOM?',
    placeholder: 'Decision, alignment, clarity, positioning, or communication concerns.'
  },

  Boardroom: {
    label: 'WHAT POSITION OR DECISION MATTERS MOST?',
    placeholder: 'What outcome matters most, who controls the room, or what pressure exists.'
  },

  Negotiation: {
    label: 'WHAT OUTCOME MATTERS MOST?',
    placeholder: 'Leverage, risks, non-negotiables, pressure points, or desired posture.'
  },

  'Sales Call': {
    label: 'WHAT NEEDS TO MOVE FORWARD?',
    placeholder: 'Trust, objection handling, positioning, urgency, or closing pressure.'
  },

  'Doctor Appointment': {
    label: 'WHAT NEEDS TO BE UNDERSTOOD CLEARLY?',
    placeholder: 'Symptoms, concerns, questions, pressure, or what you do not want missed.'
  },

  Presentation: {
    label: 'WHAT MUST LAND WITH THE ROOM?',
    placeholder: 'Message clarity, authority, pacing, confidence, or audience concerns.'
  },

  'Everyday Conversation': {
    label: 'WHAT SHOULD GEORGE UNDERSTAND?',
    placeholder: 'Context, pressure, sensitivity, relationship dynamics, or communication concerns.'
  }
}

const LIVE_CONTEXTS = [
  'Interview',
  'Meeting',
  'Boardroom',
  'Negotiation',
  'Sales Call',
  'Doctor Appointment',
  'Presentation',
  'Everyday Conversation',
]

export default function GeorgeLiveEntryPage() {
  const [selectedRoom, setSelectedRoom] = useState('')
  const [objective, setObjective] = useState('')
  const [controlWords, setControlWords] = useState('')
  const [hasLiveSession, setHasLiveSession] = useState(false)
  const [currentTier, setCurrentTier] = useState('smart')

  const activePrompt = ROOM_PROMPTS[selectedRoom] || {
    label: 'WHAT MATTERS MOST?',
    placeholder: 'What should GEORGE understand before entering the room?'
  }

  const suggestedControls = ROOM_CONTROLS[selectedRoom] || ['line', 'pause', 'shorter', 'help me respond']


  useEffect(() => {
    if (typeof window === 'undefined') return

    const tier = window.localStorage.getItem('george_tier') || 'smart'
    setCurrentTier(tier)

    const activeLive = getActiveSessionForMode('live')
    setHasLiveSession(!!activeLive)
  }, [])


  const prepareLive = () => {
    if (typeof window === 'undefined') return

    localStorage.setItem(
      'GEORGE_LIVE_SETUP',
      JSON.stringify({
        room: selectedRoom,
        objective,
        controlWords,
        createdAt: Date.now(),
      })
    )

    window.location.href = '/george/live'
  }

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#06070A] px-5 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,140,255,0.08),transparent_34%),linear-gradient(180deg,#06070A_0%,#090B10_52%,#06070A_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[760px] flex-col items-center px-6 text-center">
        <img
          src="/bxnew20.png"
          alt="BRANESx"
          className="mb-7 h-7 w-auto object-contain opacity-78"
        />

        <div className="mb-3 text-[10px] font-medium tracking-[0.28em] text-white/34">
          LIVE MODE
        </div>

        <h1 className="text-[34px] font-semibold tracking-[-0.055em] text-white md:text-[56px]">
          Set up your conversation.
        </h1>

        <p className="mt-5 max-w-[680px] text-[15px] leading-7 text-white/62 md:text-[17px]">
          LIVE is built for moments where wording, timing, pressure, and response quality matter in real time.
        </p>

        <div className="mt-8 w-full max-w-[640px] rounded-[1.35rem] border border-white/[0.055] bg-white/[0.018] p-5 text-left">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 text-[11px] tracking-[0.18em] text-white/38">
            <span>ROOM TYPE</span>
            <span className="text-[#AEB6FF]/72">OPTIONAL</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {LIVE_CONTEXTS.map((item) => {
              const active = selectedRoom === item

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelectedRoom(item)}
                  className={`rounded-full border px-3 py-2 text-[13px] transition ${
                    active
                      ? 'border-[#7C8CFF]/30 bg-[#7C8CFF]/[0.08] text-white'
                      : 'border-white/[0.06] bg-black/30 text-white/58 hover:border-[#7C8CFF]/22 hover:bg-[#7C8CFF]/[0.05] hover:text-white'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>

          <div className="mt-5">
            <div className="mb-2 text-[11px] tracking-[0.18em] text-white/34">
              {activePrompt.label}
            </div>

            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder={activePrompt.placeholder}
              rows={3}
              className="w-full resize-none rounded-[1rem] border border-white/[0.06] bg-black/20 px-4 py-3 text-[14px] leading-6 text-white/82 outline-none placeholder:text-white/24"
            />
          </div>

          <p className="mt-5 text-[13px] leading-6 text-white/46">
            Use one earbud if possible. Speak naturally. GEORGE will follow the room and assist when useful.
          </p>

          <div className="mt-5 border-t border-white/[0.05] pt-5">
            <div className="mb-2 text-[11px] tracking-[0.18em] text-white/34">
              CONTROL WORDS
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestedControls.map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => {
                    const parts = controlWords
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean)

                    if (!parts.includes(word)) {
                      setControlWords([...parts, word].join(', '))
                    }
                  }}
                  className="rounded-full border border-white/[0.06] bg-black/25 px-3 py-1.5 text-[12px] text-white/50 transition hover:border-[#7C8CFF]/22 hover:bg-[#7C8CFF]/[0.045] hover:text-white"
                >
                  {word}
                </button>
              ))}
            </div>

            <input
              value={controlWords}
              onChange={(e) => setControlWords(e.target.value)}
              placeholder="Words or phrases you can say to control GEORGE in the room"
              className="mt-3 w-full rounded-[1rem] border border-white/[0.06] bg-black/20 px-4 py-3 text-[13px] text-white/82 outline-none placeholder:text-white/24"
            />

            <p className="mt-2 text-[12px] leading-5 text-white/34">
              Example: say “line” for exact words, “pause” to hold, or “shorter” to compress the response.
            </p>
          </div>
        </div>

        <div className="mt-7 grid w-full max-w-[420px] gap-3">

          {(currentTier === 'intelligent' || currentTier === 'brilliant') ? (
            <>
              {hasLiveSession && (
                <Link
                  href="/george/live"
                  className="flex items-center justify-center rounded-[1.15rem] border border-[#7C8CFF]/20 bg-[#7C8CFF]/[0.06] px-6 py-4 text-[14px] font-medium text-white transition hover:border-[#7C8CFF]/34 hover:bg-[#7C8CFF]/[0.11]"
                >
                  Resume LIVE
                </Link>
              )}

              <button
                type="button"
                onClick={prepareLive}
                className="flex items-center justify-center rounded-[1.15rem] bg-white px-6 py-4 text-[15px] font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
              >
                Enter LIVE
              </button>

              <Link
                href="/george/live"
                className="flex items-center justify-center rounded-[1.15rem] border border-white/[0.06] bg-white/[0.018] px-6 py-4 text-[14px] font-medium text-white/52 transition hover:border-white/[0.12] hover:text-white"
              >
                Skip — I need help now
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/top-up"
                className="flex items-center justify-center rounded-[1.15rem] bg-white px-6 py-4 text-[15px] font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
              >
                Unlock LIVE
              </Link>

              <div className="rounded-[1.15rem] border border-white/[0.06] bg-white/[0.018] px-5 py-4 text-left">
                <div className="text-[13px] font-medium text-white">
                  LIVE requires Intelligent or Brilliant.
                </div>

                <div className="mt-1 text-[13px] leading-6 text-white/46">
                  Real-time conversational support, adaptive response shaping, and operational assistance during live interaction.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
