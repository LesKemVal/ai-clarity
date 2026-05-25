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

type ResourceEstimate = {
  prepSeconds: number
  runtimeMinutes: number
  estimatedCents: number
  intensity: 'Light' | 'Standard' | 'Heavy'
  resources: string[]
  reason: string
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

const CONVERSATION_BASE: Record<string, { minutes: number; cents: number; resource: string }> = {
  Interview: { minutes: 24, cents: 21, resource: 'answer framing + proof recall' },
  Meeting: { minutes: 28, cents: 23, resource: 'decision tracking + timing cues' },
  Negotiation: { minutes: 34, cents: 34, resource: 'leverage tracking + restraint cues' },
  'Sales Call': { minutes: 30, cents: 29, resource: 'objection handling + close timing' },
  'Doctor Appointment': { minutes: 24, cents: 22, resource: 'question tracking + advocacy prompts' },
  Presentation: { minutes: 36, cents: 31, resource: 'flow support + recovery cues' },
  'Everyday Conversation': { minutes: 18, cents: 14, resource: 'tone support + clarity cues' },
}

const AUDIENCE_WEIGHT: Record<string, { cents: number; resource: string }> = {
  Executive: { cents: 5, resource: 'executive compression' },
  Investor: { cents: 8, resource: 'risk/upside framing' },
  Recruiter: { cents: 4, resource: 'fit and experience framing' },
  Customer: { cents: 4, resource: 'trust and value framing' },
  Physician: { cents: 5, resource: 'factual recall discipline' },
  'Spouse / Family': { cents: 3, resource: 'tone sensitivity' },
  Regulator: { cents: 9, resource: 'precision and compliance posture' },
  'Audience / Crowd': { cents: 6, resource: 'public clarity structure' },
}

function estimateResources({
  conversationType,
  audienceType,
  pacing,
  outputMode,
  objective,
}: {
  conversationType: string
  audienceType: string
  pacing: string
  outputMode: string
  objective: string
}): ResourceEstimate {
  const base = CONVERSATION_BASE[conversationType] || CONVERSATION_BASE.Meeting
  const audience = AUDIENCE_WEIGHT[audienceType] || AUDIENCE_WEIGHT.Executive
  const pacingCents = pacing === 'Sharp' ? 3 : pacing === 'Measured' ? 2 : 0
  const outputCents = outputMode === 'Repeatable lines' ? 4 : 1
  const objectiveCents = objective.trim().length > 20 ? 3 : 0
  const estimatedCents = base.cents + audience.cents + pacingCents + outputCents + objectiveCents
  const prepSeconds = Math.min(14, 5 + Math.ceil(estimatedCents / 9))
  const runtimeMinutes = base.minutes + (audience.cents >= 8 ? 6 : 0) + (outputMode === 'Repeatable lines' ? 3 : 0)
  const intensity = estimatedCents >= 44 ? 'Heavy' : estimatedCents >= 28 ? 'Standard' : 'Light'

  return {
    prepSeconds,
    runtimeMinutes,
    estimatedCents,
    intensity,
    resources: [
      base.resource,
      audience.resource,
      pacing === 'Sharp' ? 'compressed timing' : pacing === 'Measured' ? 'slower cue spacing' : 'balanced pacing',
      outputMode === 'Repeatable lines' ? 'repeatable line generation' : 'short cue generation',
      objective.trim().length > 20 ? 'objective-specific preload' : 'general room preload',
    ],
    reason: `${conversationType} + ${audienceType.toLowerCase()} audience requires ${intensity.toLowerCase()} runtime support.`,
  }
}

function estimateWithResources(base: ResourceEstimate, resources: string[]): ResourceEstimate {
  const delta = resources.length - base.resources.length
  const estimatedCents = Math.max(8, base.estimatedCents + delta * 3)
  const runtimeMinutes = Math.max(8, base.runtimeMinutes + delta * 2)
  const prepSeconds = Math.max(4, Math.min(16, base.prepSeconds + delta))
  const intensity = estimatedCents >= 44 ? 'Heavy' : estimatedCents >= 28 ? 'Standard' : 'Light'

  return {
    ...base,
    estimatedCents,
    runtimeMinutes,
    prepSeconds,
    intensity,
    resources,
  }
}

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
  const [showResourceMeter, setShowResourceMeter] = useState(true)
  const [showPrepPreview, setShowPrepPreview] = useState(false)
  const [editableResources, setEditableResources] = useState<string[]>([])
  const [customResource, setCustomResource] = useState('')
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

  const resourceEstimate = useMemo(() => {
    return estimateResources({ conversationType, audienceType, pacing, outputMode, objective })
  }, [conversationType, audienceType, pacing, outputMode, objective])

  useEffect(() => {
    setShowResourceMeter(true)
    setEditableResources(resourceEstimate.resources)
  }, [conversationType, audienceType, pacing, outputMode, objective, resourceEstimate.resources.join('|')])

  const finalResourceEstimate = useMemo(() => {
    return estimateWithResources(resourceEstimate, editableResources.length ? editableResources : resourceEstimate.resources)
  }, [resourceEstimate, editableResources])

  const loadedSummary = useMemo(() => {
    return `${conversationType} with ${audienceType.toLowerCase()} audience · ${pacing.toLowerCase()} pacing · ${outputMode.toLowerCase()}`
  }, [conversationType, audienceType, pacing, outputMode])

  const addResource = () => {
    const clean = customResource.trim()
    if (!clean) return
    setEditableResources((items) => Array.from(new Set([...items, clean])))
    setCustomResource('')
  }

  const removeResource = (resource: string) => {
    setEditableResources((items) => items.filter((item) => item !== resource))
  }

  const startLive = (skipPrep = false, resources = editableResources) => {
    if (typeof window === 'undefined') return

    const finalResources = skipPrep ? resourceEstimate.resources : (resources.length ? resources : resourceEstimate.resources)
    const finalEstimate = skipPrep ? resourceEstimate : estimateWithResources(resourceEstimate, finalResources)

    const runtimeSupport = {
      selectedCapacityCents: finalEstimate.estimatedCents,
      selectedCapabilityIds: finalResources,
      selectedCapabilities: finalResources,
      baseRuntimeCents: finalEstimate.estimatedCents,
      capacityCents: finalEstimate.estimatedCents,
      estimatedCents: finalEstimate.estimatedCents,
      resourceEstimate: finalEstimate,
      runtimeBias: finalResources,
      audienceType,
      conversationType,
      pacing,
      compactPrep: true,
      editedByUser: !skipPrep,
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
      selectedCapacityCents: finalEstimate.estimatedCents,
      selectedCapabilityIds: finalResources,
      estimatedCents: finalEstimate.estimatedCents,
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
    window.localStorage.setItem('george_live_estimated_cents', String(finalEstimate.estimatedCents))

    window.location.href = '/george/live'
  }

  if (!ready) return null

  return (
    <main className="relative min-h-[100dvh] overflow-y-auto bg-[#06070A] px-4 pb-24 pt-5 text-white sm:px-5 sm:pt-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,140,255,0.04),transparent_28%),linear-gradient(180deg,#06070A_0%,#080A0F_52%,#06070A_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[640px]">
        <BxPageHeader backLabel="GEORGE" />

        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/26">Prep optional</div>
          <button
            type="button"
            onClick={() => startLive(true)}
            className="text-[12px] font-medium text-[#AEB6FF]/62 underline-offset-4 transition hover:text-[#D7DCFF] hover:underline"
          >
            Skip prep
          </button>
        </div>

        <section className="rounded-[1.25rem] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.005))] p-4 shadow-[0_18px_54px_rgba(0,0,0,0.26)] sm:p-5">
          <div className="text-[10px] uppercase tracking-[0.26em] text-white/28">LIVE Runtime</div>

          <h1 className="mt-3 text-[28px] font-semibold leading-[1.02] tracking-[-0.05em] text-white/88 sm:text-[38px]">
            Prepare for conversation.
          </h1>

          <p className="mt-4 text-[14px] leading-6 text-white/46">
            Choose the type of conversation and who you are speaking with. GEORGE prepares pacing, support, and conversational guidance before LIVE begins.
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

          <div className="bx-command-shimmer mt-3 overflow-hidden rounded-[1.08rem] border border-[#8FB6C9]/[0.10] bg-[linear-gradient(180deg,rgba(143,182,201,0.055),rgba(8,12,18,0.92))] shadow-[0_20px_60px_rgba(0,0,0,0.32)]">
            <button
              type="button"
              onClick={() => setShowResourceMeter((value) => !value)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DCFF]/36">Operational runtime</div>
                <div className="mt-1 text-[13px] text-white/72">
                  Runtime Window ~{finalResourceEstimate.runtimeMinutes}m · Runtime Cost ~{finalResourceEstimate.estimatedCents}¢
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#8FB6C9]/52">
                  {finalResourceEstimate.intensity} runtime load
                </div>
              </div>
              <span className="text-[12px] text-white/34">{showResourceMeter ? 'Hide' : 'Show'}</span>
            </button>

            {showResourceMeter && (
              <div className="border-t border-white/[0.035] px-4 pb-4 pt-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-[0.9rem] border border-[#8FB6C9]/[0.08] bg-[#8FB6C9]/[0.04] px-2 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
                    <div className="text-[18px] font-semibold tracking-[-0.04em] text-white/76">{finalResourceEstimate.prepSeconds}s</div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/26">prep</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-[#8FB6C9]/[0.08] bg-[#8FB6C9]/[0.04] px-2 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
                    <div className="text-[18px] font-semibold tracking-[-0.04em] text-white/76">{finalResourceEstimate.runtimeMinutes}m</div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/26">runtime</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-[#8FB6C9]/[0.08] bg-[#8FB6C9]/[0.04] px-2 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
                    <div className="text-[18px] font-semibold tracking-[-0.04em] text-white/76">~{finalResourceEstimate.estimatedCents}¢</div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/26">cost</div>
                  </div>
                </div>

                <p className="mt-3 text-[12px] leading-5 text-[#D7DCFF]/42">{finalResourceEstimate.reason}</p>
              </div>
            )}
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
              onClick={() => setShowPrepPreview(true)}
              className="min-h-[50px] rounded-[1rem] border border-[#D7DCFF]/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(222,232,255,0.92))] px-5 py-3 text-[14px] font-semibold tracking-[-0.02em] text-[#05060A] shadow-[0_18px_48px_rgba(0,0,0,0.26)] transition hover:scale-[1.01] hover:bg-white"
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

      {showPrepPreview && (
        <div className="fixed inset-0 z-[240] flex items-end justify-center bg-black/68 px-3 pb-3 backdrop-blur-[10px] sm:items-center sm:pb-0">
          <div className="bx-command-shimmer w-full max-w-[560px] overflow-hidden rounded-[1.3rem] border border-[#8FB6C9]/[0.10] bg-[linear-gradient(180deg,rgba(11,16,24,0.98),rgba(6,8,12,0.98))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.58)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/30">Prep room</div>
                <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-white/86">Review what GEORGE will load.</h2>
              </div>
              <button type="button" onClick={() => setShowPrepPreview(false)} className="rounded-full px-2 py-1 text-[12px] text-white/38 hover:text-white/70">Close</button>
            </div>

            <div className="mt-4 rounded-[1rem] border border-[#8FB6C9]/[0.08] bg-[#8FB6C9]/[0.045] px-4 py-3 text-[13px] leading-6 text-white/58 shadow-[0_12px_32px_rgba(0,0,0,0.22)]">
              {loadedSummary} · ~{finalResourceEstimate.runtimeMinutes}m · ~{finalResourceEstimate.estimatedCents}¢
            </div>

            <div className="mt-4">
              <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/28">Resources</div>
              <div className="flex flex-wrap gap-2">
                {editableResources.map((resource) => (
                  <button
                    key={resource}
                    type="button"
                    onClick={() => removeResource(resource)}
                    className="rounded-full border border-[#8FB6C9]/[0.10] bg-[#8FB6C9]/[0.045] px-3 py-1.5 text-[12px] text-[#D7DCFF]/58 shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition hover:border-red-300/24 hover:bg-red-300/[0.05] hover:text-red-100/82"
                    title="Tap to remove"
                  >
                    {resource} ×
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={customResource}
                  onChange={(event) => setCustomResource(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') addResource()
                  }}
                  placeholder="Add resource, e.g. silence timing"
                  className="bx-command-shimmer min-w-0 flex-1 rounded-[0.95rem] border border-[#8FB6C9]/[0.08] bg-black/24 px-3 py-2.5 text-[13px] text-white/76 outline-none placeholder:text-white/24"
                />
                <button type="button" onClick={addResource} className="rounded-[0.95rem] border border-[#8FB6C9]/[0.10] bg-[#8FB6C9]/[0.04] px-3 py-2.5 text-[12px] text-[#D7DCFF]/58 transition hover:bg-[#8FB6C9]/[0.08] hover:text-white">Add</button>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <button
                type="button"
                onClick={() => startLive(false, editableResources)}
                className="min-h-[50px] rounded-[1rem] border border-[#D7DCFF]/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(222,232,255,0.92))] px-5 py-3 text-[14px] font-semibold tracking-[-0.02em] text-[#05060A] shadow-[0_18px_48px_rgba(0,0,0,0.26)] transition hover:scale-[1.01] hover:bg-white"
              >
                Now Start LIVE
              </button>
              <button type="button" onClick={() => setShowPrepPreview(false)} className="min-h-[48px] rounded-[0.95rem] border border-white/[0.045] bg-black/18 px-5 py-3 text-[13px] font-medium text-white/44 transition hover:bg-white/[0.02] hover:text-white/68">Edit setup</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
