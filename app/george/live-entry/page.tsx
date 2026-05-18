'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getActiveSessionForMode } from '@/lib/george/session/store'
import { getActiveRuntimeMotionContext } from '@/lib/george/operator/load-runtime-overlay'

const ROOM_CONTROLS: Record<string, string[]> = {
  Interview: ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  Meeting: ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  Boardroom: ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  Negotiation: ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  Debate: ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  'Sales Call': ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  'Doctor Appointment': ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  Presentation: ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  Influencer: ['hmm', 'right', 'ok', 'let me reset that', 'let’s keep it simple'],
  'Everyday Conversation': ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
}


const ROOM_RUNTIME_ESTIMATES: Record<
  string,
  {
    baseCents: number
    statement: string
    support: Array<{ label: string; cents: number }>
  }
> = {
  Interview: {
    baseCents: 18,
    statement: 'Estimated cost for a typical LIVE interview. Still pennies, but visible so the user understands what the conversation is spending.',
    support: [
      { label: 'light interview support', cents: 18 },
      { label: 'active answer shaping', cents: 24 },
      { label: 'high-pressure interview', cents: 31 },
    ],
  },

  Meeting: {
    baseCents: 22,
    statement: 'Estimated cost for a typical LIVE meeting where GEORGE tracks timing, clarity, and decisions.',
    support: [
      { label: 'light alignment', cents: 22 },
      { label: 'decision support', cents: 29 },
      { label: 'pressure meeting', cents: 37 },
    ],
  },

  Boardroom: {
    baseCents: 48,
    statement: 'Estimated cost for a higher-pressure executive conversation with heavier runtime support.',
    support: [
      { label: 'executive cues', cents: 48 },
      { label: 'proof pressure', cents: 64 },
      { label: 'high-stakes room', cents: 79 },
    ],
  },

  Negotiation: {
    baseCents: 36,
    statement: 'Estimated cost for a LIVE negotiation where leverage, timing, and framing matter.',
    support: [
      { label: 'timing cues', cents: 36 },
      { label: 'pressure handling', cents: 49 },
      { label: 'strong carry', cents: 62 },
    ],
  },

  Debate: {
    baseCents: 32,
    statement: 'Estimated cost for a pressure conversation where GEORGE helps protect the frame.',
    support: [
      { label: 'clarity cues', cents: 32 },
      { label: 'rebuttal shaping', cents: 44 },
      { label: 'proof pressure', cents: 56 },
    ],
  },

  'Sales Call': {
    baseCents: 24,
    statement: 'Estimated cost for a LIVE sales call with pacing, objection, and trust support.',
    support: [
      { label: 'light call cues', cents: 24 },
      { label: 'objection support', cents: 33 },
      { label: 'closing pressure', cents: 42 },
    ],
  },

  'Doctor Appointment': {
    baseCents: 27,
    statement: 'Estimated cost for a LIVE appointment where clarity and recall matter.',
    support: [
      { label: 'question support', cents: 27 },
      { label: 'clarification help', cents: 35 },
      { label: 'high-detail visit', cents: 44 },
    ],
  },

  Presentation: {
    baseCents: 25,
    statement: 'Estimated cost for LIVE presentation support around pacing, message, and closing strength.',
    support: [
      { label: 'pacing support', cents: 25 },
      { label: 'message refinement', cents: 34 },
      { label: 'strong close', cents: 43 },
    ],
  },

  Influencer: {
    baseCents: 21,
    statement: 'Estimated cost for LIVE creator support when the audience, guest, brand, or comments can shift the room quickly.',
    support: [
      { label: 'audience cues', cents: 21 },
      { label: 'brand-safe response', cents: 29 },
      { label: 'live pressure recovery', cents: 39 },
    ],
  },

  'Everyday Conversation': {
    baseCents: 12,
    statement: 'Estimated cost for a lighter LIVE conversation where GEORGE helps keep the exchange clear.',
    support: [
      { label: 'light cues', cents: 12 },
      { label: 'next responses', cents: 18 },
      { label: 'sensitive conversation', cents: 26 },
    ],
  },
}

const LIVE_CAPACITY_OPTIONS = [
  {
    id: 'sharper_answers',
    label: 'Sharper answers',
    cents: 4,
    description: 'Cleaner proof, fewer wandering responses.',
    runtimeBias: {
      answerCompression: 'high',
      hedgeReduction: true,
      proofMode: 'stronger',
    },
  },
  {
    id: 'pacing_guidance',
    label: 'Pacing guidance',
    cents: 8,
    description: 'Slow down before pressure compounds.',
    runtimeBias: {
      silenceWindows: 'active',
      cadenceAdjustment: 'adaptive',
      interruptionThreshold: 'higher',
    },
  },
  {
    id: 'pressure_management',
    label: 'Pressure management',
    cents: 17,
    description: 'Hold composure under challenge.',
    runtimeBias: {
      pressureDetection: 'high',
      resistanceForecasting: true,
      composureCues: 'active',
    },
  },
]

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

  Influencer: {
    label: 'WHAT SHOULD GEORGE PROTECT?',
    placeholder: 'Audience pressure, guest, brand tone, comments, controversy, or the response style you need.'
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
  'Influencer',
  'Everyday Conversation',
]

export default function GeorgeLiveEntryPage() {
  const [selectedRoom, setSelectedRoom] = useState('')
  const [objective, setObjective] = useState('')
  const [controlWords, setControlWords] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [speechCadence, setSpeechCadence] = useState('Balanced')
  const [liveAssistMode, setLiveAssistMode] = useState<'cues' | 'lines'>('cues')
  const [showLanguageScopePrompt, setShowLanguageScopePrompt] = useState(false)
  const [hasLiveSession, setHasLiveSession] = useState(false)
  const [currentTier, setCurrentTier] = useState('smart')
  const [runtimeMotionContext, setRuntimeMotionContext] = useState<any>(null)
  const [selectedCapacityCents, setSelectedCapacityCents] = useState<number | null>(null)
  const [selectedCapabilityIds, setSelectedCapabilityIds] = useState<string[]>([])
  const [steeringSaved, setSteeringSaved] = useState(false)

  const activePrompt = ROOM_PROMPTS[selectedRoom] || {
    label: 'WHAT SHOULD GEORGE TRACK?',
    placeholder: 'Outcome, pressure, timing, risk, or what matters most in the room.'
  }

  const runtimeEstimate = ROOM_RUNTIME_ESTIMATES[selectedRoom]
  const selectedCapabilities = LIVE_CAPACITY_OPTIONS.filter((item) => selectedCapabilityIds.includes(item.id))
  const capacityCents = selectedCapabilities.reduce((sum, item) => sum + item.cents, 0)
  const baseRuntimeCents = selectedCapacityCents ?? runtimeEstimate?.baseCents ?? null
  const estimatedCents = baseRuntimeCents === null ? null : baseRuntimeCents + capacityCents

  const suggestedControls = ROOM_CONTROLS[selectedRoom] || ['line', 'pause', 'shorter', 'help me respond']

  const toggleCapability = (id: string) => {
    setSelectedCapabilityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const persistSteeringPhrases = (value = controlWords) => {
    if (typeof window === 'undefined') return

    const normalized = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .join(', ')

    setControlWords(normalized)
    window.localStorage.setItem('george_live_control_words', normalized)
    setSteeringSaved(true)
    window.setTimeout(() => setSteeringSaved(false), 1200)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const tier = window.localStorage.getItem('george_tier') || 'smart'
    setCurrentTier(tier)

    const motionContext = getActiveRuntimeMotionContext()
    if (motionContext) {
      setRuntimeMotionContext(motionContext)
    }

    try {
      const rawLiveSetup = window.localStorage.getItem('GEORGE_LIVE_SETUP')
      const liveSetup = rawLiveSetup ? JSON.parse(rawLiveSetup) : null

      // Start New LIVE must not inherit old room/objective/cost from GEORGE_LAST_LIVE_SETUP.
      // If the user skips prep, GEORGE enters listening mode and infers context from the room.
      if (liveSetup?.runtimeOverlay) {
        if (liveSetup.language) setSelectedLanguage(liveSetup.language)
        if (liveSetup.cadence) setSpeechCadence(liveSetup.cadence)
        if (liveSetup.liveAssistMode === 'lines' || liveSetup.liveAssistMode === 'cues') {
          setLiveAssistMode(liveSetup.liveAssistMode)
        }
      }
    } catch {}

    const liveLanguage = window.localStorage.getItem('george_live_language')
    if (liveLanguage) {
      setSelectedLanguage(liveLanguage)
    }

    const savedCadence = window.localStorage.getItem('george_live_cadence')
    if (savedCadence) {
      setSpeechCadence(savedCadence)
    }

    const savedDelivery = window.localStorage.getItem('george_live_assist_mode')
    if (savedDelivery === 'lines' || savedDelivery === 'cues') {
      setLiveAssistMode(savedDelivery)
    }

    const savedControlWords = window.localStorage.getItem('george_live_control_words')
    if (savedControlWords) {
      setControlWords(savedControlWords)
    }

    try {
      const savedRuntimeSupport = JSON.parse(window.localStorage.getItem('george_live_runtime_support') || 'null')
      if (Array.isArray(savedRuntimeSupport?.selectedCapabilityIds)) {
        setSelectedCapabilityIds(savedRuntimeSupport.selectedCapabilityIds)
      }
      if (typeof savedRuntimeSupport?.selectedCapacityCents === 'number') {
        setSelectedCapacityCents(savedRuntimeSupport.selectedCapacityCents)
      }
    } catch {}

    const activeLive = getActiveSessionForMode('live')
    setHasLiveSession(!!activeLive)
  }, [])

  const prepareLive = () => {
    if (typeof window === 'undefined') return

    const runtimeSupport = {
      selectedCapacityCents,
      selectedCapabilityIds,
      selectedCapabilities,
      baseRuntimeCents,
      capacityCents,
      estimatedCents,
      runtimeBias: selectedCapabilities.map((item) => item.runtimeBias),
    }

    const liveSetup = {
      room: selectedRoom,
      language: selectedLanguage,
      cadence: speechCadence,
      objective,
      controlWords,
      liveAssistMode,
      runtimeSupport,
      selectedCapacityCents,
      selectedCapabilityIds,
      estimatedCents,
      createdAt: Date.now(),
    }

    localStorage.setItem('george_start_new_live', '1')
    localStorage.removeItem('george_active_live_session_id')
    localStorage.removeItem('george_active_campaign_session_id')
    localStorage.removeItem('george_active_campaign')
    localStorage.removeItem('george_active_context')
    localStorage.removeItem('george_active_label')

    localStorage.setItem('GEORGE_LIVE_SETUP', JSON.stringify(liveSetup))
    localStorage.setItem('GEORGE_LAST_LIVE_SETUP', JSON.stringify(liveSetup))
    localStorage.setItem('george_live_assist_mode', liveAssistMode)
    localStorage.setItem('george_live_runtime_support', JSON.stringify(runtimeSupport))
    localStorage.setItem('george_live_estimated_cents', String(estimatedCents ?? ''))

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
          className="mb-3 h-[118px] w-[200px] object-contain opacity-95"
        />

        <div className="mb-3 text-[10px] font-medium tracking-[0.3em] text-white/34">
          LIVE RUNTIME
        </div>

        <p className="mb-4 text-[16px] tracking-[-0.015em] text-white/70">
          Bx is what you use when the conversation <span className="font-semibold text-white/86">is</span> the work.
        </p>

        <h1 className="text-[32px] font-semibold tracking-[-0.052em] text-white md:text-[52px]">
          Prepare the room.
        </h1>

        <p className="mt-4 max-w-[590px] text-[14px] leading-6 text-white/54 md:text-[16px]">
          Answer a few questions and pre-load context so GEORGE is sharpest.
        </p>

        {runtimeMotionContext && (
          <div className="mt-5 w-full max-w-[620px] rounded-[1rem] border border-[#AAB4FF]/12 bg-[#AAB4FF]/[0.035] px-5 py-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#C9D0FF]/48">
              Loaded Context
            </div>

            <div className="mt-2 text-[15px] font-medium text-white/86">
              {runtimeMotionContext.title}
            </div>

            <p className="mt-2 text-[13px] leading-6 text-white/52">
              {runtimeMotionContext.operationalGoal}
            </p>
          </div>
        )}

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
                  onClick={() => {
                    setSelectedRoom(item)
                    setSelectedCapacityCents(null)
                  }}
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

          {runtimeEstimate && (
            <div className="mt-5 rounded-[0.95rem] border border-[#AAB4FF]/10 bg-[linear-gradient(180deg,rgba(111,132,255,0.045),rgba(255,255,255,0.010))] p-4 shadow-[0_0_24px_rgba(170,180,255,0.035)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#C9D0FF]/52">
                    Runtime estimate
                  </div>

                  <div className="mt-2 text-[30px] font-semibold tracking-[-0.045em] text-white/92">
                    ~{estimatedCents}¢
                  </div>
                </div>

                <div className="rounded-full border border-[#AAB4FF]/12 bg-black/24 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-[#C9D0FF]/52">
                  Room + capacity
                </div>
              </div>

              <p className="mt-3 text-[13px] leading-6 text-white/48">
                This is not a subscription price. It is a visible runtime estimate for how much support GEORGE is carrying in this room.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {runtimeEstimate.support.map((item) => {
                  const active = selectedCapacityCents === item.cents || (!selectedCapacityCents && item.cents === runtimeEstimate.baseCents)

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setSelectedCapacityCents(item.cents)}
                      className={`rounded-[0.75rem] border px-3 py-2 text-left text-[12px] transition ${
                        active
                          ? 'border-[#AAB4FF]/30 bg-[#AAB4FF]/10 text-white shadow-[0_0_18px_rgba(170,180,255,0.07)]'
                          : 'border-white/[0.055] bg-black/20 text-white/52 hover:border-[#AAB4FF]/18 hover:bg-[#AAB4FF]/[0.045] hover:text-white/80'
                      }`}
                    >
                      <span className="block font-medium">{item.label}</span>
                      <span className="mt-1 block text-[11px] text-white/36">~{item.cents}¢ base</span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 border-t border-white/[0.05] pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/34">
                    Add capacity
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#AAB4FF]/52">
                    Real runtime bias
                  </div>
                </div>

                <div className="grid gap-2">
                  {LIVE_CAPACITY_OPTIONS.map((item) => {
                    const active = selectedCapabilityIds.includes(item.id)

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleCapability(item.id)}
                        className={`rounded-[0.85rem] border px-4 py-3 text-left transition ${
                          active
                            ? 'border-[#AAB4FF]/30 bg-[#AAB4FF]/10 text-white shadow-[0_0_18px_rgba(170,180,255,0.07)]'
                            : 'border-white/[0.055] bg-black/20 text-white/54 hover:border-[#AAB4FF]/18 hover:bg-[#AAB4FF]/[0.045] hover:text-white/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[13px] font-semibold">{item.label}</div>
                            <div className="mt-1 text-[12px] leading-5 text-white/40">{item.description}</div>
                          </div>
                          <div className="shrink-0 text-[12px] font-semibold text-[#C9D0FF]/82">
                            +{item.cents}¢
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 rounded-[0.95rem] border border-white/[0.055] bg-black/20 p-4">
            <div className="mb-2 text-[11px] tracking-[0.18em] text-white/34">
              LIVE OUTPUT
            </div>

            <p className="mb-3 text-[13px] leading-6 text-white/54">
              Choose how GEORGE assists in LIVE. GEORGE keeps this setting until you change it.
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { id: 'cues', title: 'Cues', body: 'Short directional support.' },
                { id: 'lines', title: 'Repeatable lines', body: 'Exact words to say.' },
              ].map((item) => {
                const active = liveAssistMode === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const next = item.id as 'cues' | 'lines'
                      setLiveAssistMode(next)
                      window.localStorage.setItem('george_live_assist_mode', next)
                    }}
                    className={`rounded-[0.8rem] border px-3 py-3 text-left transition-all duration-150 ${
                      active
                        ? 'border-[#AAB4FF]/35 bg-[#AAB4FF]/10 text-white shadow-[0_0_18px_rgba(170,180,255,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]'
                        : 'border-white/[0.055] bg-black/20 text-white/54 hover:border-white/[0.11] hover:bg-white/[0.024] hover:text-white/80'
                    }`}
                  >
                    <div className="text-[13px] font-semibold">{item.title}</div>
                    <div className="mt-1 text-[12px] leading-5 text-white/46">{item.body}</div>
                  </button>
                )
              })}
            </div>

            <p className="mt-3 text-[12px] leading-5 text-white/40">
              Use natural sounds like “hmm…” or “ok…” to give GEORGE room to help shape the next move.
            </p>
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
                      const next = [...parts, word].join(', ')
                      setControlWords(next)
                      window.localStorage.setItem('george_live_control_words', next)
                      setSteeringSaved(true)
                      window.setTimeout(() => setSteeringSaved(false), 1200)
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  persistSteeringPhrases()
                }
              }}
              onBlur={() => persistSteeringPhrases()}
              placeholder="Add natural phrases GEORGE should listen for during LIVE"
              className="mt-3 w-full rounded-[0.9rem] border border-white/[0.055] bg-black/22 px-4 py-3 text-[13px] text-white/82 outline-none placeholder:text-white/22 transition focus:border-[#AAB4FF]/24 focus:bg-white/[0.018]"
            />

            <p className="mt-2 text-[12px] leading-5 text-white/32">
              {steeringSaved ? 'Saved for LIVE.' : 'Press Enter to save. “OK” resets GEORGE behavior and lets your next phrase become the new direction.'}
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
                  Resume Conversation
                </Link>
              )}

              <button
                type="button"
                onClick={prepareLive}
                className="flex items-center justify-center rounded-[0.95rem] border border-[#8FB6C9]/[0.34] bg-[#0B1622] px-6 py-4 text-[15px] font-semibold text-[#E6F3FA] shadow-[0_0_0_1px_rgba(143,182,201,0.08),0_14px_32px_rgba(0,0,0,0.34)] transition hover:border-[#8FB6C9]/[0.48] hover:bg-[#101C2A]"
              >
                Enter LIVE
              </button>

              <Link
                href="/george/live"
                className="flex items-center justify-center rounded-[0.95rem] border border-white/[0.06] bg-white/[0.012] px-6 py-4 text-[14px] font-medium text-white/50 transition-all duration-150 hover:border-white/[0.10] hover:bg-white/[0.022] hover:text-white/74"
              >
                Enter without setup
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
