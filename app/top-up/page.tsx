'use client'

import { useEffect, useMemo, useState } from 'react'
import PageShell from '@/components/layout/PageShell'

type TierId = 'smart' | 'intelligent' | 'brilliant' | 'brilliant_day'

type TierCard = {
  id: TierId
  name: string
  price: string
  tone: string
  promise: string
  label: string
  details: string[]
  action?: string
  checkout?: 'intelligent' | 'brilliant' | 'brilliant_day'
}

const tiers: TierCard[] = [
  {
    id: 'smart',
    name: 'Smart',
    price: '$0',
    tone: 'Base',
    promise: 'Everyday direction when you need the next move.',
    label: 'Explain Smart',
    details: [
      'GEORGE tracks the active conversation so goals and decisions stay coherent.',
      'Compresses complexity into clearer next moves instead of overwhelming the user.',
      'Adjusts explanation depth and structure based on user signal and context.',
      'Useful for planning, decisions, problem-solving, and reducing drift during everyday work.',
    ],
  },
  {
    id: 'intelligent',
    name: 'Intelligent',
    price: '$10',
    tone: 'Continuity',
    promise: 'Stronger memory, follow-through, and execution support.',
    label: 'Explain Intelligent',
    details: [
      'GEORGE remembers operational context across sessions so users do not repeatedly restart.',
      'Tracks evolving goals, pressure, working style, and prior interaction over time.',
      'Uses continuity and signal to sharpen execution, planning, momentum, and decision support.',
      'Useful for long-term projects, business direction, operational thinking, and ongoing execution.',
    ],
    action: 'Activate Intelligent',
    checkout: 'intelligent',
  },
  {
    id: 'brilliant',
    name: 'Brilliant',
    price: '$25',
    tone: 'LIVE',
    promise: 'When LIVE support carries the moment.',
    label: 'Explain Brilliant',
    details: [
      'LIVE listens for conversational pressure, interruptions, hesitation, openings, and timing shifts.',
      'Compresses support into fast cues, repeatable lines, and next-move guidance while conversations are happening.',
      'Adjusts pacing, wording, silence, and rhetorical posture based on the room and user direction.',
      'Useful for negotiations, interviews, difficult conversations, calls, meetings, and high-pressure communication.',
    ],
    action: 'Activate Brilliant',
    checkout: 'brilliant',
  },
  {
    id: 'brilliant_day',
    name: 'Brilliant Day',
    price: '$5',
    tone: 'Temporary',
    promise: 'Use LIVE for the room in front of you today.',
    label: 'Explain Day Access',
    details: [
      'Temporary LIVE activation for interviews, negotiations, meetings, calls, or difficult rooms.',
      'Uses the same conversational runtime support as Brilliant without requiring a long-term tier change.',
      'Useful when timing, wording, pressure, or one important conversation may affect the next opportunity.',
      'Designed for immediate operational support during specific high-leverage moments.',
    ],
    action: 'Activate Day Access',
    checkout: 'brilliant_day',
  },
]

export default function TopUpPage() {
  const [intent, setIntent] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [feedback, setFeedback] = useState('')
  const [message, setMessage] = useState('')
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [expandedTier, setExpandedTier] = useState<TierId | null>(null)
  const [checkoutEmail, setCheckoutEmail] = useState('')

  const currentUsageGuidance = useMemo(() => {
    if (intent === 'conversation' || intent === 'pro') {
      return {
        tone: 'LIVE leaning',
        message:
          'Brilliant becomes strongest when LIVE support becomes part of your regular workflow.',
      }
    }

    if (intent === 'make-george-yours') {
      return {
        tone: 'Continuity fit',
        message:
          'Intelligent already covers most continuity and execution workflows comfortably.',
      }
    }

    return {
      tone: 'Current fit',
      message:
        'Your current usage still fits comfortably within Intelligent unless LIVE becomes routine.',
    }
  }, [intent])


  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    setIntent(params.get('intent'))
    setCheckoutEmail(localStorage.getItem('george_email') || '')
  }, [])

  const headline = useMemo(() => {
    if (intent === 'make-george-yours') {
      return 'Configure GEORGE.'
    }
    if (intent === 'conversation') {
      return 'Activate LIVE support.'
    }
    if (intent === 'pro') {
      return 'Open Brilliant Day.'
    }
    return 'Access and continuity.'
  }, [intent])

  async function playVoiceSample(voice: string, label: string) {
    try {
      setPlayingVoice(voice)
      setMessage(`Playing ${label} sample...`)

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: 'This is GEORGE. Clear direction, real momentum, and the next best move.',
          speed: 1.15,
          tier: 'intelligent',
          voice,
        }),
      })

      if (!res.ok) {
        setMessage(`${label} is not available yet.`)
        return
      }

      const buffer = await res.arrayBuffer()
      const blob = new Blob([buffer], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)

      audio.onended = () => {
        URL.revokeObjectURL(url)
        setPlayingVoice(null)
        setMessage('')
      }

      await audio.play()
    } catch {
      setMessage('Unable to play voice sample right now.')
      setPlayingVoice(null)
    }
  }

  const subcopy = useMemo(() => {
    if (intent === 'make-george-yours') {
      return 'Set identity, voice, and continuity behavior without changing the core system.'
    }
    if (intent === 'conversation') {
      return 'Support for rooms where timing, wording, and pressure matter.'
    }
    if (intent === 'pro') {
      return 'Temporary LIVE support for high-pressure communication.'
    }
    return 'Choose the level of continuity, operational support, and LIVE access that fits how you work.'
  }, [intent])

  function submitFeedback() {
    if (!feedback.trim()) {
      setMessage('Add feedback first.')
      return
    }

    const payload = {
      type: feedbackType,
      feedback: feedback.trim(),
      source: 'george-feedback',
      timestamp: Date.now(),
    }

    const existing = JSON.parse(localStorage.getItem('GEORGE_FEEDBACK') || '[]')
    existing.push(payload)
    localStorage.setItem('GEORGE_FEEDBACK', JSON.stringify(existing))
    setMessage('Feedback saved. Thank you.')
    setFeedback('')
  }

  async function startCheckout(tier: 'intelligent' | 'brilliant' | 'brilliant_day') {
    try {
      setMessage('Opening secure checkout...')

      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, email: checkoutEmail.trim().toLowerCase() || undefined }),
      })

      const data = await res.json()

      if (!res.ok || !data?.url) {
        setMessage(data?.error || 'Unable to start checkout right now.')
        return
      }

      window.location.href = data.url
    } catch {
      setMessage('Unable to start checkout right now.')
    }
  }

  async function redeemFounderCode() {
    const code = window.prompt('Enter founder access code')

    if (!code) return

    try {
      const response = await fetch('/api/founder-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || (data.tier !== 'intelligent' && data.tier !== 'brilliant')) {
        setMessage(data.error || 'Invalid founder code.')
        return
      }

      localStorage.setItem('george_tier', data.tier)
      localStorage.setItem('george_founder_access', 'server-verified')

      setMessage(`Founder ${data.tier === 'brilliant' ? 'Brilliant' : 'Intelligent'} access activated.`)
      setTimeout(() => {
        window.location.href = `/george?tier=${data.tier}`
      }, 500)
    } catch {
      setMessage('Founder code check failed.')
    }
  }

  return (
    <PageShell backToGeorge withSidebar={false}>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[320px] overflow-hidden bg-[linear-gradient(180deg,rgba(10,12,16,0.22),rgba(11,13,18,0.10)_58%,transparent)] md:h-[360px]">
        <div className="mx-auto h-full w-full max-w-[1320px] px-4 md:px-6 xl:px-8">
          <div className="relative -ml-2 h-[198px] w-[calc(100%+16px)] overflow-hidden rounded-[1.35rem] bg-[linear-gradient(105deg,rgba(10,12,16,0.18),rgba(18,20,26,0.16)_44%,rgba(7,10,17,0.16))] opacity-85 md:-ml-4 md:h-[224px] md:w-[calc(100%+32px)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_42%,rgba(174,182,255,0.06),transparent_19%),radial-gradient(circle_at_74%_38%,rgba(126,201,218,0.06),transparent_18%)]" />
            <div className="absolute left-[6%] top-[58px] h-px w-[84%] bg-gradient-to-r from-transparent via-[#9BB8CF]/16 to-transparent" />
            <div className="absolute left-[12%] top-[98px] h-px w-[72%] bg-gradient-to-r from-transparent via-white/[0.045] to-transparent" />
            <div className="absolute left-[24%] top-[136px] h-px w-[56%] bg-gradient-to-r from-transparent via-[#7EC9DA]/10 to-transparent" />
            <div className="absolute left-[18%] top-[74px] h-2 w-2 rounded-[0.25rem] bg-white/[0.045]" />
            <div className="absolute left-[42%] top-[90px] h-2.5 w-2.5 rounded-[0.3rem] bg-[#8FB6C9]/10" />
            <div className="absolute left-[63%] top-[64px] h-3 w-3 rounded-[0.35rem] bg-[#7EC9DA]/8" />
            <div className="absolute left-[80%] top-[116px] h-2 w-2 rounded-[0.25rem] bg-white/[0.035]" />
            <div className="absolute right-[5%] top-[32px] h-24 w-24 rounded-full border border-[#8FB6C9]/7" />
            <div className="absolute right-[9%] top-[56px] h-16 w-16 rounded-full border border-white/[0.035]" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#0B0D12]/76 to-[#0B0D12]" />
      </div>

      <div className="relative z-10 space-y-6">
        <section className="rounded-[0.9rem] border border-white/[0.028] bg-white/[0.006] p-5 md:p-6">
          <div className="max-w-5xl space-y-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">
              ACCESS LEVELS
            </p>

            <h1 className="text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">
              {headline}
            </h1>

            <p className="max-w-3xl text-sm leading-7 text-white/48 md:text-base">
              {subcopy}
            </p>

            <div className="rounded-[0.8rem] border border-white/[0.028] bg-black/20 px-4 py-3 text-sm text-white/64">
              Pay for the level of recall, support, and LIVE access you actually need.
            </div>

            <div className="rounded-[0.8rem] border border-[#AAB4FF]/10 bg-[linear-gradient(180deg,rgba(111,132,255,0.045),rgba(255,255,255,0.012))] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#C9D0FF]/46">
                {currentUsageGuidance.tone}
              </div>

              <p className="mt-2 text-sm leading-6 text-white/62">
                {currentUsageGuidance.message}
              </p>
            </div>

            <div className="rounded-[0.8rem] border border-white/[0.035] bg-black/22 px-4 py-3">
              <label className="block text-[10px] uppercase tracking-[0.18em] text-white/34">
                Continuity email
              </label>

              <input
                type="email"
                value={checkoutEmail}
                onChange={(event) => {
                  const value = event.target.value.trim().toLowerCase()
                  setCheckoutEmail(value)

                  if (value) {
                    localStorage.setItem('george_email', value)
                  } else {
                    localStorage.removeItem('george_email')
                  }
                }}
                placeholder="you@example.com"
                className="mt-2 w-full bg-transparent text-sm text-white/82 outline-none placeholder:text-white/24"
              />

              <p className="mt-2 text-xs leading-5 text-white/38">
                GEORGE uses this to connect access, restoration, and continuity across devices.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={redeemFounderCode}
                className="rounded-[0.7rem] border border-white/[0.045] bg-white/[0.010] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/58 transition hover:border-white/[0.09] hover:bg-white/[0.022] hover:text-white/76"
              >
                Founder Code
              </button>

              <span className="text-[11px] tracking-[0.08em] text-white/30">
                Founder access restores local continuity access.
              </span>
            </div>

            <div className="grid gap-3 pt-2 lg:grid-cols-4">
              {tiers.map((tier) => {
                const expanded = expandedTier === tier.id
                const featured = tier.id === 'brilliant'

                return (
                  <div
                    key={tier.id}
                    className={`rounded-[0.9rem] border bg-white/[0.010] p-4 transition-all duration-200 ${
                      featured
                        ? 'border-[#AAB4FF]/16 shadow-[0_0_28px_rgba(170,180,255,0.045)]'
                        : 'border-white/[0.028]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-white/88">{tier.name}</p>
                        <div className="mt-2 text-2xl font-semibold tracking-tight text-white/88">{tier.price}</div>
                      </div>

                      <span className="rounded-[0.55rem] border border-white/[0.035] bg-white/[0.014] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/44">
                        {tier.tone}
                      </span>
                    </div>

                    <p className="mt-4 min-h-[44px] text-sm leading-6 text-white/48">
                      {tier.promise}
                    </p>

                    <button
                      type="button"
                      onClick={() => setExpandedTier(expanded ? null : tier.id)}
                      className="mt-4 flex w-full items-center justify-between rounded-[0.7rem] border border-white/[0.035] bg-black/18 px-3 py-2.5 text-left text-[12px] font-medium text-white/58 transition hover:border-white/[0.08] hover:bg-white/[0.022] hover:text-white/80"
                    >
                      <span>{tier.label}</span>
                      <span className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>⌄</span>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <ul className="mt-3 space-y-2 border-t border-white/[0.035] pt-3 text-sm leading-6 text-white/46">
                          {tier.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {tier.action && tier.checkout && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!tier.checkout) return
                          startCheckout(tier.checkout)
                        }}
                        className={`mt-4 w-full rounded-[0.7rem] border px-4 py-3 text-sm font-semibold transition ${
                          featured
                            ? 'border-[#AAB4FF]/22 bg-[#AAB4FF]/[0.075] text-[#D7DCFF] hover:bg-[#AAB4FF]/[0.11]'
                            : 'border-white/[0.055] bg-white/[0.014] text-white/72 hover:border-white/[0.10] hover:bg-white/[0.03] hover:text-white/88'
                        }`}
                      >
                        {tier.action}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-[0.8rem] border border-[#AAB4FF]/16 bg-[#AAB4FF]/[0.045] px-4 py-3 text-sm text-[#D7DCFF]">
            {message}
          </div>
        )}

        <section className="grid gap-4 lg:grid-cols-2">
          <div id="feedback" className="scroll-mt-24 rounded-[0.9rem] border border-white/[0.028] bg-white/[0.010] p-5">
            <div className="space-y-4">
              <p className="text-sm font-medium text-white/84">Feedback</p>
              <p className="text-sm leading-7 text-white/44">
                Note what feels confusing, useful, missing, or worth tightening.
              </p>

              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full rounded-[0.85rem] border border-white/[0.04] bg-[#10131B]/58 px-4 py-3 text-white outline-none"
              >
                <option value="suggestion">Suggestion</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature request</option>
                <option value="confusion">Something felt confusing</option>
              </select>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                placeholder="What should change?"
                className="w-full rounded-[0.85rem] border border-white/[0.04] bg-[#10131B]/58 px-4 py-3 text-white outline-none placeholder:text-white/28"
              />

              <button
                type="button"
                onClick={submitFeedback}
                className="w-full rounded-[0.7rem] border border-white/[0.045] px-5 py-3 text-sm font-medium text-white/72 transition hover:border-white/[0.10] hover:bg-white/[0.022] hover:text-white/86"
              >
                Save feedback
              </button>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
