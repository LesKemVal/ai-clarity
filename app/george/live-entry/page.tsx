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
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [speechCadence, setSpeechCadence] = useState('Balanced')
  const [showLanguageScopePrompt, setShowLanguageScopePrompt] = useState(false)
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

    const liveLanguage = window.localStorage.getItem('george_live_language')
    if (liveLanguage) {
      setSelectedLanguage(liveLanguage)
    }

    const savedCadence = window.localStorage.getItem('george_live_cadence')
    if (savedCadence) {
      setSpeechCadence(savedCadence)
    }

    const activeLive = getActiveSessionForMode('live')
    setHasLiveSession(!!activeLive)
  }, [])

  const prepareLive = () => {
    if (typeof window === 'undefined') return

    localStorage.setItem(
      'GEORGE_LIVE_SETUP',
      JSON.stringify({
        room: selectedRoom,
        language: selectedLanguage,
        cadence: speechCadence,
        objective,
        controlWords,
        createdAt: Date.now(),
      })
    )

    window.location.href = '/george/live'
  }

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#06070A] px-5 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(196,210,255,0.045),transparent_30%),linear-gradient(180deg,#06070A_0%,#090B10_52%,#06070A_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[720px] flex-col items-center px-5 text-center">
        <img
          src="/logofav.png"
          alt="BRANESx"
          className="mb-7 h-6 w-auto object-contain opacity-74"
        />

        <div className="mb-3 text-[10px] font-medium tracking-[0.3em] text-white/34">
          LIVE RUNTIME
        </div>

        <h1 className="text-[32px] font-semibold tracking-[-0.052em] text-white md:text-[52px]">
          Prepare the room.
        </h1>

        <p className="mt-4 max-w-[590px] text-[14px] leading-6 text-white/54 md:text-[16px]">
          Set the room, language, and natural steering phrases before LIVE starts.
        </p>

        <div className="mt-7 w-full max-w-[620px] rounded-[1.05rem] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.010))] p-5 text-left shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-[10px]">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 text-[11px] tracking-[0.18em] text-white/34">
            <span>ROOM</span>
            <span className="text-white/38">OPTIONAL</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {LIVE_CONTEXTS.map((item) => {
              const active = selectedRoom === item

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelectedRoom(item)}
                  className={`rounded-[0.8rem] border px-3 py-2 text-[13px] transition-all duration-150 ${
                    active
                      ? 'border-white/[0.14] bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.038))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                      : 'border-white/[0.055] bg-black/20 text-white/54 hover:border-white/[0.11] hover:bg-white/[0.024] hover:text-white/80'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>

          <div className="mt-5">
            <div className="mb-2 text-[11px] tracking-[0.18em] text-white/34">
              LANGUAGE
            </div>

            <div className="flex flex-wrap gap-2">
              {['English', 'Español', 'Français', 'العربية', '中文', '日本語'].map((language) => {
                const active = selectedLanguage === language

                return (
                  <button
                    key={language}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(language)
                      window.localStorage.setItem('george_live_language', language)
                      setShowLanguageScopePrompt(true)
                    }}
                    className={`rounded-[0.75rem] border px-3 py-1.5 text-[12px] transition-all duration-150 ${
                      active
                        ? 'border-[#AAB4FF]/35 bg-[#AAB4FF]/10 text-[#D7DCFF] shadow-[0_0_18px_rgba(170,180,255,0.10),inset_0_1px_0_rgba(255,255,255,0.08)]'
                        : 'border-white/[0.055] bg-black/20 text-white/54 hover:border-[#AAB4FF]/24 hover:bg-[#AAB4FF]/[0.045] hover:text-white/80'
                    }`}
                  >
                    {language}
                  </button>
                )
              })}
            </div>
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
              className="w-full resize-none rounded-[0.9rem] border border-white/[0.055] bg-black/22 px-4 py-3 text-[14px] leading-6 text-white/82 outline-none placeholder:text-white/22 transition focus:border-white/[0.12] focus:bg-white/[0.018]"
            />
          </div>

          <div className="mt-5 border-t border-white/[0.05] pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] tracking-[0.18em] text-white/34">
                  SPEECH CADENCE
                </div>
                <p className="mt-1 text-[12px] leading-5 text-white/36">
                  Bias how GEORGE speaks in your ear. GEORGE can still adjust if the room changes.
                </p>
              </div>

              <div className="text-[10px] uppercase tracking-[0.16em] text-[#AAB4FF]/62">
                LIVE only
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: 'Measured', note: 'slower' },
                { label: 'Balanced', note: 'clear' },
                { label: 'Sharp', note: 'faster' },
              ].map((mode) => {
                const active = speechCadence === mode.label

                return (
                  <button
                    key={mode.label}
                    type="button"
                    onClick={() => {
                      setSpeechCadence(mode.label)
                      window.localStorage.setItem('george_live_cadence', mode.label)
                    }}
                    className={`rounded-[0.8rem] border px-3 py-2 text-left transition-all duration-150 ${
                      active
                        ? 'border-[#AAB4FF]/35 bg-[#AAB4FF]/10 text-[#D7DCFF] shadow-[0_0_18px_rgba(170,180,255,0.10),inset_0_1px_0_rgba(255,255,255,0.08)]'
                        : 'border-white/[0.055] bg-black/20 text-white/54 hover:border-[#AAB4FF]/24 hover:bg-[#AAB4FF]/[0.045] hover:text-white/80'
                    }`}
                  >
                    <span className="block text-[12px] font-medium">{mode.label}</span>
                    <span className="mt-0.5 block text-[10px] text-white/34">{mode.note}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-5 border-t border-white/[0.05] pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] tracking-[0.18em] text-white/34">
                  STEERING PHRASES
                </div>
                <p className="mt-1 text-[12px] leading-5 text-white/36">
                  Natural phrases you can reuse in the room without exposing GEORGE.
                </p>
              </div>

              <div className="text-[10px] uppercase tracking-[0.16em] text-[#AAB4FF]/62">
                LIVE only
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
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
                  className="rounded-[0.75rem] border border-white/[0.055] bg-black/20 px-3 py-1.5 text-[12px] text-white/50 transition-all duration-150 hover:border-[#AAB4FF]/24 hover:bg-[#AAB4FF]/[0.045] hover:text-white/80"
                >
                  {word}
                </button>
              ))}
            </div>

            <input
              value={controlWords}
              onChange={(e) => setControlWords(e.target.value)}
              placeholder="Add phrases you naturally say, separated by commas"
              className="mt-3 w-full rounded-[0.9rem] border border-white/[0.055] bg-black/22 px-4 py-3 text-[13px] text-white/82 outline-none placeholder:text-white/22 transition focus:border-[#AAB4FF]/24 focus:bg-white/[0.018]"
            />

            <p className="mt-2 text-[12px] leading-5 text-white/32">
              “hmm” is strongest: reusable, natural, and almost invisible.
            </p>
          </div>
        </div>

        {showLanguageScopePrompt && (
          <div className="mt-4 rounded-[0.95rem] border border-[#AAB4FF]/18 bg-[#AAB4FF]/[0.045] px-4 py-3 text-left">
            <div className="text-[12px] font-medium text-[#D7DCFF]">
              Use {selectedLanguage} only for LIVE?
            </div>

            <div className="mt-1 text-[11px] leading-5 text-white/42">
              GEORGE will use this language for LIVE setup and cues. You can also apply it across the site.
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLanguageScopePrompt(false)}
                className="rounded-full border border-white/[0.06] bg-black/20 px-3 py-1.5 text-[11px] text-white/58 transition hover:border-white/[0.12] hover:text-white/82"
              >
                LIVE only
              </button>

              <button
                type="button"
                onClick={() => {
                  window.localStorage.setItem('george_language', selectedLanguage)
                  setShowLanguageScopePrompt(false)
                }}
                className="rounded-full border border-[#AAB4FF]/25 bg-[#AAB4FF]/10 px-3 py-1.5 text-[11px] text-[#D7DCFF] transition hover:bg-[#AAB4FF]/15"
              >
                Apply sitewide
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 grid w-full max-w-[400px] gap-3">

          {(currentTier === 'intelligent' || currentTier === 'brilliant') ? (
            <>
              {hasLiveSession && (
                <Link
                  href="/george/live"
                  className="flex items-center justify-center rounded-[0.95rem] border border-white/[0.065] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] px-6 py-4 text-[14px] font-medium text-white/74 transition-all duration-150 hover:border-white/[0.11] hover:bg-white/[0.04] hover:text-white"
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
                className="flex items-center justify-center rounded-[0.95rem] border border-white/[0.06] bg-white/[0.012] px-6 py-4 text-[14px] font-medium text-white/50 transition-all duration-150 hover:border-white/[0.10] hover:bg-white/[0.022] hover:text-white/74"
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
