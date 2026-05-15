'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getActiveSessionForMode } from '@/lib/george/session/store'

const ROOM_CONTROLS: Record<string, string[]> = {
  Interview: ['line', 'shorter', 'pause', 'answer clean'],
  Meeting: ['summarize', 'push back', 'pause', 'next question'],
  Boardroom: ['position', 'proof', 'slow down', 'next move'],
  Negotiation: ['line', 'hold firm', 'counter', 'pause'],
  Debate: ['rebuttal', 'proof', 'frame', 'pause'],
  'Sales Call': ['line', 'objection', 'close', 'shorter'],
  'Doctor Appointment': ['slow down', 'clarify', 'question', 'repeat'],
  Presentation: ['pace', 'stronger', 'simplify', 'close'],
  'Everyday Conversation': ['line', 'pause', 'shorter', 'help me respond'],
}

const ROOM_PROMPTS: Record<string, { label: string; placeholder: string }> = {
  Interview: {
    label: 'WHAT WILL THEY BE LISTENING FOR?',
    placeholder: 'Role, pressure points, proof, concerns, or the position you need to hold.'
  },

  Meeting: {
    label: 'WHAT NEEDS TO MOVE?',
    placeholder: 'Decision, alignment, pressure, risk, or the position you need to protect.'
  },

  Boardroom: {
    label: 'WHAT POSITION MATTERS?',
    placeholder: 'Outcome, authority, pressure, risk, or what cannot be lost in the room.'
  },

  Negotiation: {
    label: 'WHAT MUST HOLD?',
    placeholder: 'Leverage, limits, fallback, pressure points, or desired posture.'
  },

  'Sales Call': {
    label: 'WHAT NEEDS TO ADVANCE?',
    placeholder: 'Trust, objection, urgency, qualification, or closing pressure.'
  },

  Debate: {
    label: 'WHAT POSITION MUST HOLD?',
    placeholder: 'Claim, opponent pressure, likely contradictions, proof demands, or the frame you cannot lose.'
  },

  'Doctor Appointment': {
    label: 'WHAT CANNOT BE MISSED?',
    placeholder: 'Symptoms, timeline, concerns, questions, pressure, or what needs repeating.'
  },

  Presentation: {
    label: 'WHAT MUST LAND?',
    placeholder: 'Message, audience pressure, pacing, proof, or the strongest close.'
  },

  'Everyday Conversation': {
    label: 'WHAT SHOULD GEORGE TRACK?',
    placeholder: 'Context, pressure, sensitivity, relationship dynamics, or desired outcome.'
  }
}

const LIVE_CONTEXTS = [
  'Interview',
  'Meeting',
  'Boardroom',
  'Negotiation',
  'Sales Call',
  'Debate',
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
    label: 'WHAT SHOULD GEORGE TRACK?',
    placeholder: 'Outcome, pressure, timing, risk, or what matters most in the room.'
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(174,182,255,0.045),transparent_32%),linear-gradient(180deg,#06070A_0%,#090B10_52%,#06070A_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.05]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[720px] flex-col items-center px-5 text-center">
        <img
          src="/bxnew20.png"
          alt="BRANESx"
          className="mb-7 h-6 w-auto object-contain opacity-74"
        />

        <div className="mb-3 text-[10px] font-medium tracking-[0.3em] text-white/30">
          LIVE RUNTIME
        </div>

        <h1 className="text-[32px] font-semibold tracking-[-0.052em] text-white md:text-[52px]">
          Prepare the room.
        </h1>

        <p className="mt-4 max-w-[590px] text-[14px] leading-6 text-white/52 md:text-[16px]">
          Give GEORGE the useful context before you enter. LIVE follows the conversation in real time and can provide repeatable lines, short cues, or silence when restraint is stronger.
        </p>

        <div className="mt-8 w-full max-w-[620px] rounded-[1.05rem] border border-white/[0.045] bg-white/[0.012] p-5 text-left">
          <div className="flex items-center justify-between border-b border-white/[0.045] pb-3 text-[11px] tracking-[0.18em] text-white/34">
            <span>ROOM</span>
            <span className="text-[#AEB6FF]/58">OPTIONAL</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {LIVE_CONTEXTS.map((item) => {
              const active = selectedRoom === item

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelectedRoom(item)}
                  className={`rounded-[0.8rem] border px-3 py-2 text-[13px] transition ${
                    active
                      ? 'border-[#AEB6FF]/24 bg-[#AEB6FF]/[0.055] text-white'
                      : 'border-white/[0.052] bg-black/20 text-white/52 hover:border-[#AEB6FF]/16 hover:bg-white/[0.018] hover:text-white/78'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>

          <div className="mt-5">
            <div className="mb-2 text-[11px] tracking-[0.18em] text-white/32">
              {activePrompt.label}
            </div>

            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder={activePrompt.placeholder}
              rows={3}
              className="w-full resize-none rounded-[0.9rem] border border-white/[0.052] bg-black/20 px-4 py-3 text-[14px] leading-6 text-white/80 outline-none placeholder:text-white/22"
            />
          </div>

          <p className="mt-4 text-[13px] leading-6 text-white/42">
            Use one earbud if possible. Speak normally. GEORGE can give you exact words to repeat, posture cues, or a pause when silence protects the moment.
          </p>

          <div className="mt-5 border-t border-white/[0.045] pt-5">
            <div className="mb-2 text-[11px] tracking-[0.18em] text-white/32">
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
                  className="rounded-[0.75rem] border border-white/[0.052] bg-black/20 px-3 py-1.5 text-[12px] text-white/48 transition hover:border-[#AEB6FF]/16 hover:bg-white/[0.018] hover:text-white/76"
                >
                  {word}
                </button>
              ))}
            </div>

            <input
              value={controlWords}
              onChange={(e) => setControlWords(e.target.value)}
              placeholder="Words you can say to adjust GEORGE without breaking the room"
              className="mt-3 w-full rounded-[0.9rem] border border-white/[0.052] bg-black/20 px-4 py-3 text-[13px] text-white/80 outline-none placeholder:text-white/22"
            />

            <p className="mt-2 text-[12px] leading-5 text-white/30">
              Example: “line” for exact words, “pause” to hold, “shorter” to compress.
            </p>
          </div>
        </div>

        <div className="mt-7 grid w-full max-w-[400px] gap-3">

          {(currentTier === 'intelligent' || currentTier === 'brilliant') ? (
            <>
              {hasLiveSession && (
                <Link
                  href="/george/live"
                  className="flex items-center justify-center rounded-[0.95rem] border border-[#AEB6FF]/18 bg-[#AEB6FF]/[0.045] px-6 py-4 text-[14px] font-medium text-white transition hover:border-[#AEB6FF]/26 hover:bg-[#AEB6FF]/[0.07]"
                >
                  Resume runtime
                </Link>
              )}

              <button
                type="button"
                onClick={prepareLive}
                className="flex items-center justify-center rounded-[0.95rem] bg-white px-6 py-4 text-[15px] font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
              >
                Enter LIVE
              </button>

              <Link
                href="/george/live"
                className="flex items-center justify-center rounded-[0.95rem] border border-white/[0.055] bg-white/[0.012] px-6 py-4 text-[14px] font-medium text-white/48 transition hover:border-white/[0.09] hover:text-white/72"
              >
                Start without setup
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/top-up"
                className="flex items-center justify-center rounded-[0.95rem] bg-white px-6 py-4 text-[15px] font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
              >
                Unlock LIVE
              </Link>

              <div className="rounded-[0.95rem] border border-white/[0.055] bg-white/[0.012] px-5 py-4 text-left">
                <div className="text-[13px] font-medium text-white/88">
                  LIVE requires Intelligent or Brilliant.
                </div>

                <div className="mt-1 text-[13px] leading-6 text-white/42">
                  Real-time cues, silence control, and exact wording when the room requires it.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
