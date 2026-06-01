'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchGeorgeSessionAuthority, readCachedGeorgeSessionAuthority } from '@/lib/george/session-authority'

type Tier = 'smart' | 'intelligent' | 'brilliant'

type PersonalSignals = {
  helpStyle: string
  optimizeFor: string
  remember: string
  updatedAt: number
}

type OutcomeSignals = {
  activeOutcome: string
  mattersMost: string
  tradeoff: string
  nextPressure: string
  updatedAt: number
}

const PERSONAL_SIGNAL_KEY = 'GEORGE_PERSONAL_SIGNALS'
const OUTCOME_SIGNAL_KEY = 'GEORGE_OUTCOME_SIGNALS'

const helpStyles = [
  'Give me the next move',
  'Give me usable lines',
  'Explain the reasoning',
  'Challenge my thinking',
  'Keep me focused',
  'Adapt as needed',
]

const optimizeOptions = [
  'Clarity',
  'Precision',
  'Confidence',
  'Speed',
  'Composure',
  'Learning',
]

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback

  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function inferOutcomeOptions(text: string) {
  const lower = text.toLowerCase()

  if (/fund|investor|raise|capital|offering|reg cf|reg a|round/.test(lower)) {
    return {
      mattersMost: ['Lead investor', 'Credibility', 'Momentum', 'Terms', 'Compliance', 'Speed'],
      tradeoffs: ['Speed over control', 'Credibility over hype', 'Terms over urgency', 'Strategic fit over volume'],
      pressures: ['Investor doubt', 'Documentation', 'Timing', 'Regulatory caution', 'Proof of traction'],
    }
  }

  if (/sell|buyer|acquisition|company|valuation|deal|negotiat/.test(lower)) {
    return {
      mattersMost: ['Price', 'Control', 'Speed', 'Relationship', 'Leverage', 'Certainty'],
      tradeoffs: ['Price over speed', 'Control over simplicity', 'Certainty over upside', 'Relationship over pressure'],
      pressures: ['Low offer', 'Delay', 'Information gap', 'Weak leverage', 'Decision fatigue'],
    }
  }

  if (/build|product|app|platform|launch|startup|feature|ui|code/.test(lower)) {
    return {
      mattersMost: ['Product', 'Revenue', 'Distribution', 'Retention', 'Speed', 'Stability'],
      tradeoffs: ['Stability over features', 'Speed over polish', 'Revenue over aesthetics', 'Clarity over complexity'],
      pressures: ['Scope creep', 'Broken flow', 'Too many options', 'Weak positioning', 'Technical debt'],
    }
  }

  if (/interview|job|career|resume|hiring|work/.test(lower)) {
    return {
      mattersMost: ['Positioning', 'Confidence', 'Clarity', 'Negotiation', 'Follow-through', 'Proof'],
      tradeoffs: ['Clarity over volume', 'Confidence over explanation', 'Fit over desperation', 'Proof over claims'],
      pressures: ['Hard questions', 'Weak framing', 'Salary pressure', 'Unclear role', 'Follow-up timing'],
    }
  }

  if (/learn|study|test|exam|skill|training/.test(lower)) {
    return {
      mattersMost: ['Understanding', 'Practice', 'Retention', 'Confidence', 'Speed', 'Mastery'],
      tradeoffs: ['Mastery over speed', 'Practice over theory', 'Examples over abstraction', 'Retention over volume'],
      pressures: ['Confusion', 'Inconsistency', 'Too much material', 'Weak recall', 'No feedback'],
    }
  }

  return {
    mattersMost: ['Clarity', 'Speed', 'Confidence', 'Precision', 'Relationship', 'Follow-through'],
    tradeoffs: ['Clarity over speed', 'Precision over volume', 'Confidence over hesitation', 'Relationship over pressure'],
    pressures: ['Unclear next step', 'Too many options', 'Weak framing', 'Timing', 'Lack of signal'],
  }
}

export default function SignalPage() {
  const [ready, setReady] = useState(false)
  const [tier, setTier] = useState<Tier>('smart')
  const [saved, setSaved] = useState(false)

  const [personal, setPersonal] = useState<PersonalSignals>({
    helpStyle: '',
    optimizeFor: '',
    remember: '',
    updatedAt: 0,
  })

  const [outcome, setOutcome] = useState<OutcomeSignals>({
    activeOutcome: '',
    mattersMost: '',
    tradeoff: '',
    nextPressure: '',
    updatedAt: 0,
  })

  useEffect(() => {
    const cached = readCachedGeorgeSessionAuthority()
    setTier(cached.tier)

    fetchGeorgeSessionAuthority()
      .then((authority) => setTier(authority.tier))
      .catch(() => {})

    const savedPersonal = readJson<PersonalSignals>(PERSONAL_SIGNAL_KEY, {
      helpStyle: '',
      optimizeFor: '',
      remember: '',
      updatedAt: 0,
    })

    const savedOutcome = readJson<OutcomeSignals>(OUTCOME_SIGNAL_KEY, {
      activeOutcome: '',
      mattersMost: '',
      tradeoff: '',
      nextPressure: '',
      updatedAt: 0,
    })

    let inferredOutcome = savedOutcome.activeOutcome

    try {
      const lastLive = JSON.parse(window.localStorage.getItem('GEORGE_LAST_LIVE_SETUP') || 'null')
      if (!inferredOutcome && lastLive?.objective) inferredOutcome = lastLive.objective
    } catch {}

    if (!inferredOutcome) {
      inferredOutcome =
        window.localStorage.getItem('george_user_mission') ||
        window.localStorage.getItem('george_user_priority') ||
        ''
    }

    setPersonal(savedPersonal)
    setOutcome({ ...savedOutcome, activeOutcome: inferredOutcome })
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    if (tier === 'smart') {
      window.location.replace('/top-up?intent=make-george-yours')
    }
  }, [ready, tier])

  const options = useMemo(() => inferOutcomeOptions(outcome.activeOutcome), [outcome.activeOutcome])

  function saveSignals() {
    const now = Date.now()

    const nextPersonal = {
      ...personal,
      updatedAt: now,
    }

    const nextOutcome = {
      ...outcome,
      updatedAt: now,
    }

    writeJson(PERSONAL_SIGNAL_KEY, nextPersonal)
    writeJson(OUTCOME_SIGNAL_KEY, nextOutcome)

    window.localStorage.setItem('george_signal_updated_at', String(now))
    window.localStorage.setItem('george_signal_available', 'true')

    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  if (!ready) return null
  if (tier === 'smart') return null

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#05060A] px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-240px] h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-[#8FB6C9]/[0.035] blur-[140px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/[0.055]" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-[920px]">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logofav.png" alt="BRANESx" className="h-10 w-10 rounded-[0.85rem] object-contain opacity-90" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.26em] text-white/28">Signals</p>
              <p className="text-[11px] text-white/30">Personal + outcome</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => (window.location.href = '/george')}
            className="text-[11px] uppercase tracking-[0.18em] text-white/36 transition hover:text-white/70"
          >
            Back
          </button>
        </div>

        <div className="rounded-[1.25rem] border border-white/[0.045] bg-black/24 p-4 shadow-[0_18px_58px_rgba(0,0,0,0.34)] backdrop-blur-[18px] sm:p-5">
          <div className="border-b border-white/[0.045] pb-5">
            <h1 className="max-w-3xl text-[34px] font-semibold leading-[0.98] tracking-[-0.06em] text-white/92 sm:text-[48px]">
              Sharpen your way forward.
            </h1>
            <p className="mt-4 max-w-2xl text-[14px] leading-7 text-white/48">
              Give GEORGE better signal so guidance can adapt to your goals, priorities, and future.
            </p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-4">
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/28">Personal signals</p>
                <p className="mt-2 text-[13px] leading-6 text-white/44">
                  Durable preferences. GEORGE uses these to work with you without asking every time.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-[12px] text-white/62">How should GEORGE help most often?</p>
                  <div className="grid gap-2">
                    {helpStyles.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPersonal((value) => ({ ...value, helpStyle: item }))}
                        className={`rounded-[0.82rem] border px-3 py-2 text-left text-[13px] transition ${
                          personal.helpStyle === item
                            ? 'border-[#8FB6C9]/[0.22] bg-[#8FB6C9]/[0.08] text-white'
                            : 'border-white/[0.045] bg-black/18 text-white/46 hover:text-white/72'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[12px] text-white/62">When something matters, optimize for:</p>
                  <div className="flex flex-wrap gap-2">
                    {optimizeOptions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPersonal((value) => ({ ...value, optimizeFor: item }))}
                        className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
                          personal.optimizeFor === item
                            ? 'border-white/[0.18] bg-white/[0.08] text-white'
                            : 'border-white/[0.055] bg-black/18 text-white/42 hover:text-white/70'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block rounded-[0.9rem] border border-white/[0.045] bg-black/18 p-3">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/28">Optional</span>
                  <textarea
                    value={personal.remember}
                    onChange={(event) => setPersonal((value) => ({ ...value, remember: event.target.value }))}
                    rows={3}
                    placeholder="Anything GEORGE should remember about how to work with you."
                    className="mt-2 w-full resize-none bg-transparent text-[13px] leading-5 text-white/68 outline-none placeholder:text-white/24"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[1rem] border border-[#8FB6C9]/[0.08] bg-[#8FB6C9]/[0.035] p-4">
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#D7DCFF]/34">Outcome signals</p>
                <p className="mt-2 text-[13px] leading-6 text-white/48">
                  Goal-specific signal. These answers help GEORGE justify the path and adapt while still moving toward the outcome.
                </p>
              </div>

              <label className="block rounded-[0.9rem] border border-white/[0.055] bg-black/20 p-3">
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/30">Desired outcome</span>
                <textarea
                  value={outcome.activeOutcome}
                  onChange={(event) => setOutcome((value) => ({ ...value, activeOutcome: event.target.value }))}
                  rows={3}
                  placeholder="What are you trying to make happen?"
                  className="mt-2 w-full resize-none bg-transparent text-[14px] leading-5 text-white/72 outline-none placeholder:text-white/24"
                />
              </label>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 text-[12px] text-white/62">What matters most for this objective?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {options.mattersMost.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setOutcome((value) => ({ ...value, mattersMost: item }))}
                        className={`rounded-[0.82rem] border px-3 py-2 text-left text-[12px] transition ${
                          outcome.mattersMost === item
                            ? 'border-[#8FB6C9]/[0.24] bg-[#8FB6C9]/[0.10] text-white'
                            : 'border-white/[0.045] bg-black/18 text-white/44 hover:text-white/70'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[12px] text-white/62">Which tradeoff should GEORGE respect?</p>
                  <div className="grid gap-2">
                    {options.tradeoffs.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setOutcome((value) => ({ ...value, tradeoff: item }))}
                        className={`rounded-[0.82rem] border px-3 py-2 text-left text-[12px] transition ${
                          outcome.tradeoff === item
                            ? 'border-white/[0.16] bg-white/[0.075] text-white'
                            : 'border-white/[0.045] bg-black/18 text-white/44 hover:text-white/70'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[12px] text-white/62">What pressure should GEORGE account for?</p>
                  <div className="flex flex-wrap gap-2">
                    {options.pressures.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setOutcome((value) => ({ ...value, nextPressure: item }))}
                        className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
                          outcome.nextPressure === item
                            ? 'border-white/[0.18] bg-white/[0.08] text-white'
                            : 'border-white/[0.055] bg-black/18 text-white/42 hover:text-white/70'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.045] pt-4">
            <p className="text-[11px] leading-5 text-white/34">
              GEORGE uses this signal to support the desired outcome. It does not replace your judgment.
            </p>

            <button
              type="button"
              onClick={saveSignals}
              className="shrink-0 rounded-[0.85rem] border border-[#8FB6C9]/[0.18] bg-[#8FB6C9]/[0.08] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#D7DCFF]/82 transition hover:border-[#8FB6C9]/[0.32] hover:text-white active:scale-[0.97]"
            >
              {saved ? 'Saved' : 'Save Signal'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
