'use client'

import { useEffect, useMemo, useState } from 'react'
import BxPageHeader from '@/components/BxPageHeader'
import { getActiveSessionForMode } from '@/lib/george/session/store'
import { fetchGeorgeSessionAuthority, readCachedGeorgeSessionAuthority } from '@/lib/george/session-authority'
import { getActiveRuntimeMotionContext } from '@/lib/george/operator/load-runtime-overlay'

type Tier = 'smart' | 'intelligent' | 'brilliant'

type SelectOption = {
  label: string
  helper?: string
}

const CONVERSATION_TYPES: SelectOption[] = [
  { label: 'Interview', helper: 'answers, confidence, proof' },
  { label: 'Meeting', helper: 'clarity, timing, decisions' },
  { label: 'Negotiation', helper: 'leverage, restraint, asks' },
  { label: 'Sales Call', helper: 'objections, trust, close' },
  { label: 'Doctor Appointment', helper: 'questions, symptoms, advocacy' },
  { label: 'Presentation', helper: 'flow, points, recovery' },
  { label: 'Everyday Conversation', helper: 'tone, clarity, next words' },
]

const AUDIENCE_TYPES: SelectOption[] = [
  { label: 'Executive', helper: 'concise, proof-aware' },
  { label: 'Investor', helper: 'traction, risk, upside' },
  { label: 'Recruiter', helper: 'fit, experience, confidence' },
  { label: 'Customer', helper: 'value, objections, trust' },
  { label: 'Physician', helper: 'facts, symptoms, questions' },
  { label: 'Spouse / Family', helper: 'calm, honest, careful' },
  { label: 'Regulator', helper: 'precise, compliant, measured' },
  { label: 'Audience / Crowd', helper: 'clear, structured, steady' },
]

const PACING_OPTIONS: SelectOption[] = [
  { label: 'Measured', helper: 'slower, controlled' },
  { label: 'Balanced', helper: 'natural and clear' },
  { label: 'Sharp', helper: 'faster, compact' },
]

const OUTPUT_OPTIONS: SelectOption[] = [
  { label: 'Cues', helper: 'short directional support' },
  { label: 'Repeatable lines', helper: 'exact words to say' },
]

function CompactSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}) {
  return (
    <label className="block rounded-[1rem] border border-white/[0.04] bg-black/20 px-4 py-3">
      <span className="block text-[10px] uppercase tracking-[0.2em] text-white/28">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full appearance-none bg-transparent text-[15px] font-medium text-white/78 outline-none"
      >
        {options.map((option) => (
          <option key={option.label} value={option.label} className="bg-[#090B10] text-white">
            {option.label}
          </option>
        ))}
      </select>
      <span className="mt-1 block text-[12px] leading-5 text-white/34">
        {options.find((option) => option.label === value)?.helper}
      </span>
    </label>
  )
}

export default function LiveEntryClient() {
  const [ready, setReady] = useState(false)
  const [tier, setTier] = useState<Tier>('smart')
  const [conversationType, setConversationType] = useState('Meeting')
  const [audienceType, setAudienceType] = useState('Executive')
  const [pacing, setPacing] = useState('Balanced')
  const [outputMode, setOutputMode] = useState('Cues')
  const [objective, setObjective] = useState('')
  const [controlWords, setControlWords] = useState('hmm, right, ok, let me think')
  const [hasLiveSession, setHasLiveSession] = useState(false)
  const [runtimeMotionContext, setRuntimeMotionContext] = useState<any>(null)

  useEffect(() => {
    const cached = readCachedGeorgeSessionAuthority()
    setTier(cached.tier)

    fetchGeorgeSessionAuthority()
      .then((authority) => setTier(authority.tier))
      .catch(() => {})

    try {
      const saved = JSON.parse(window.localStorage.getItem('GEORGE_LAST_LIVE_SETUP') || 'null')
      if (saved?.room) setConversationType(saved.room)
      if (saved?.audienceType) setAudienceType(saved.audienceType)
      if (saved?.cadence) setPacing(saved.cadence)
      if (saved?.liveAssistMode === 'lines') setOutputMode('Repeatable lines')
      if (saved?.objective) setObjective(saved.objective)
      if (saved?.controlWords) setControlWords(saved.controlWords)
    } catch {}

    try {
      setRuntimeMotionContext(getActiveRuntimeMotionContext())
    } catch {
      setRuntimeMotionContext(null)
    }

    setHasLiveSession(!!getActiveSessionForMode('live'))
    setReady(true)
  }, [])

  const liveAssistMode = outputMode === 'Repeatable lines' ? 'lines' : 'cues'

  const loadedSummary = useMemo(() => {
    return `${conversationType} with ${audienceType.toLowerCase()} audience · ${pacing.toLowerCase()} pacing · ${outputMode.toLowerCase()}`
  }, [conversationType, audienceType, pacing, outputMode])

  const startLive = (skipPrep = false) => {
    if (typeof window === 'undefined') return

    const runtimeSupport = {
      selectedCapacityCents: null,
      selectedCapabilityIds: [],
      selectedCapabilities: [],
      baseRuntimeCents: null,
      capacityCents: 0,
      estimatedCents: null,
      resourceEstimate: null,
      runtimeBias: [],
      audienceType,
      conversationType,
      pacing,
      compactPrep: true,
    }

    const liveSetup = {
      room: skipPrep ? 'Adaptive LIVE' : conversationType,
      audienceType,
      language: window.localStorage.getItem('george_live_language') || 'English',
      cadence: pacing,
      objective,
      controlWords,
      liveAssistMode,
      skipPrep,
      runtimeSupport,
      selectedCapacityCents: null,
      selectedCapabilityIds: [],
      estimatedCents: null,
      compactPrep: true,
      createdAt: Date.now(),
    }

    window.localStorage.setItem('george_start_new_live', '1')
    window.localStorage.removeItem('george_active_live_session_id')
    window.localStorage.removeItem('george_active_campaign_session_id')
    window.localStorage.removeItem('george_active_campaign')
    window.localStorage.removeItem('george_active_context')
    window.localStorage.removeItem('george_active_label')
    window.localStorage.setItem('GEORGE_LIVE_SETUP', JSON.stringify(liveSetup))
    window.localStorage.setItem('GEORGE_LAST_LIVE_SETUP', JSON.stringify(liveSetup))
    window.localStorage.setItem('george_live_assist_mode', liveAssistMode)
    window.localStorage.setItem('george_live_runtime_support', JSON.stringify(runtimeSupport))
    window.localStorage.removeItem('george_live_estimated_cents')

    window.location.href = '/george/live'
  }

  if (!ready) return null

  return (
    <main className="relative min-h-[100dvh] overflow-y-auto bg-[#06070A] px-4 pb-24 pt-5 text-white sm:px-5 sm:pt-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,140,255,0.04),transparent_28%),linear-gradient(180deg,#06070A_0%,#080A0F_52%,#06070A_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[640px]">
        <BxPageHeader backLabel="GEORGE" />

        <section className="rounded-[1.25rem] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.005))] p-4 shadow-[0_18px_54px_rgba(0,0,0,0.26)] sm:p-5">
          <div className="text-[10px] uppercase tracking-[0.26em] text-white/28">LIVE Runtime</div>

          <h1 className="mt-3 text-[34px] font-semibold leading-[0.94] tracking-[-0.06em] text-white/88 sm:text-[46px]">
            Load the room.
          </h1>

          <p className="mt-4 text-[14px] leading-6 text-white/46">
            Choose the room and audience. GEORGE will preload pacing, posture, cue density, and response style without making setup heavy.
          </p>

          {runtimeMotionContext && (
            <div className="mt-4 rounded-[1rem] border border-[#AEB6FF]/10 bg-[#AEB6FF]/[0.035] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#D7DCFF]/44">Loaded context</div>
              <div className="mt-1 text-[14px] font-medium text-white/78">{runtimeMotionContext.title}</div>
            </div>
          )}

          <div className="mt-5 grid gap-3">
            <CompactSelect label="Conversation type" value={conversationType} options={CONVERSATION_TYPES} onChange={setConversationType} />
            <CompactSelect label="Audience type" value={audienceType} options={AUDIENCE_TYPES} onChange={setAudienceType} />
            <CompactSelect label="Pacing" value={pacing} options={PACING_OPTIONS} onChange={setPacing} />
            <CompactSelect label="Output" value={outputMode} options={OUTPUT_OPTIONS} onChange={setOutputMode} />
          </div>

          <label className="mt-3 block rounded-[1rem] border border-white/[0.04] bg-black/20 px-4 py-3">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-white/28">Objective optional</span>
            <textarea
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              rows={3}
              placeholder="Example: help me ask for the raise without overexplaining."
              className="mt-2 w-full resize-none bg-transparent text-[15px] leading-6 text-white/76 outline-none placeholder:text-white/24"
            />
          </label>

          <label className="mt-3 block rounded-[1rem] border border-white/[0.04] bg-black/20 px-4 py-3">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-white/28">Steering words</span>
            <input
              value={controlWords}
              onChange={(event) => setControlWords(event.target.value)}
              className="mt-2 w-full bg-transparent text-[15px] text-white/76 outline-none placeholder:text-white/24"
              placeholder="hmm, right, ok, let me think"
            />
          </label>

          <div className="mt-4 rounded-[1rem] border border-white/[0.035] bg-black/16 px-4 py-3 text-[13px] leading-6 text-white/42">
            Loaded: <span className="text-white/66">{loadedSummary}</span>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
            <button
              type="button"
              onClick={() => startLive(false)}
              className="min-h-[48px] rounded-[0.95rem] bg-white/[0.88] px-5 py-3 text-[14px] font-semibold text-[#05060A] transition hover:bg-white"
            >
              Start LIVE
            </button>

            <button
              type="button"
              onClick={() => startLive(true)}
              className="min-h-[48px] rounded-[0.95rem] border border-white/[0.045] bg-black/18 px-5 py-3 text-[13px] font-medium text-white/44 transition hover:bg-white/[0.02] hover:text-white/68"
            >
              Skip prep
            </button>
          </div>

          {hasLiveSession && (
            <p className="mt-3 text-[12px] leading-5 text-white/34">
              A previous LIVE session exists. Starting LIVE creates a clean room so stale context does not bleed in.
            </p>
          )}
        </section>

        {tier === 'smart' && (
          <p className="mt-4 text-center text-[12px] leading-5 text-white/32">
            LIVE access may require Intelligent or Brilliant depending on account state.
          </p>
        )}
      </div>
    </main>
  )
}
