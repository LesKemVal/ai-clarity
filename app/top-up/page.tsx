'use client'

import { useEffect, useMemo, useState } from 'react'
import PageShell from '@/components/layout/PageShell'

export default function TopUpPage() {
  const [intent, setIntent] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [feedback, setFeedback] = useState('')
  const [message, setMessage] = useState('')
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    setIntent(params.get('intent'))
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
      return 'Runtime support for rooms where timing, wording, and pressure matter.'
    }
    if (intent === 'pro') {
      return 'Temporary LIVE runtime elevation for high-pressure communication.'
    }
    return 'Choose the level of restoration, execution support, and LIVE runtime access you need.'
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
        body: JSON.stringify({ tier }),
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

  function jumpTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }


  async function redeemFounderCode() {
    const code = window.prompt('Enter founder access code')

    if (!code) return

    const normalized = code.trim().toUpperCase()

    const intelligentFounder =
      /^INTEL-FOUNDER-\d{3}$/.test(normalized)

    const brilliantFounder =
      normalized === 'BRILLIANT-FOUNDER'

    if (intelligentFounder) {
      localStorage.setItem('george_tier', 'intelligent')
      localStorage.setItem('george_founder_code', normalized)

      setMessage('Founder Intelligent access activated.')
      setTimeout(() => {
        window.location.href = '/george?tier=intelligent'
      }, 500)

      return
    }

    if (brilliantFounder) {
      localStorage.setItem('george_tier', 'brilliant')
      localStorage.setItem('george_founder_code', normalized)

      setMessage('Founder Brilliant access activated.')
      setTimeout(() => {
        window.location.href = '/george?tier=brilliant'
      }, 500)

      return
    }

    setMessage('Invalid founder code.')
  }

  return (
    <PageShell backToGeorge withSidebar={false}>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[320px] overflow-hidden bg-[linear-gradient(180deg,rgba(8,23,39,0.24),rgba(11,13,18,0.12)_58%,transparent)] md:h-[360px]">
        <div className="mx-auto h-full w-full max-w-[1320px] px-4 md:px-6 xl:px-8">
          <div className="relative -ml-2 h-[198px] w-[calc(100%+16px)] overflow-hidden rounded-[1.35rem] bg-[linear-gradient(105deg,rgba(10,18,31,0.22),rgba(29,75,102,0.18)_44%,rgba(7,10,17,0.18))] opacity-85 md:-ml-4 md:h-[224px] md:w-[calc(100%+32px)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_42%,rgba(174,182,255,0.06),transparent_19%),radial-gradient(circle_at_74%_38%,rgba(126,201,218,0.06),transparent_18%)]" />
            <div className="absolute left-[6%] top-[58px] h-px w-[84%] bg-gradient-to-r from-transparent via-[#9BB8CF]/16 to-transparent" />
            <div className="absolute left-[12%] top-[98px] h-px w-[72%] bg-gradient-to-r from-transparent via-[#AEB6FF]/11 to-transparent" />
            <div className="absolute left-[24%] top-[136px] h-px w-[56%] bg-gradient-to-r from-transparent via-[#7EC9DA]/10 to-transparent" />
            <div className="absolute left-[18%] top-[74px] h-2 w-2 rounded-[0.25rem] bg-[#AEB6FF]/10" />
            <div className="absolute left-[42%] top-[90px] h-2.5 w-2.5 rounded-[0.3rem] bg-[#8FB6C9]/10" />
            <div className="absolute left-[63%] top-[64px] h-3 w-3 rounded-[0.35rem] bg-[#7EC9DA]/8" />
            <div className="absolute left-[80%] top-[116px] h-2 w-2 rounded-[0.25rem] bg-[#AEB6FF]/8" />
            <div className="absolute right-[5%] top-[32px] h-24 w-24 rounded-full border border-[#8FB6C9]/7" />
            <div className="absolute right-[9%] top-[56px] h-16 w-16 rounded-full border border-[#AEB6FF]/6" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#0B0D12]/76 to-[#0B0D12]" />
      </div>

      <div className="relative z-10 space-y-6">
        <section className="rounded-[0.9rem] border border-white/[0.04] bg-white/[0.006] p-5 backdrop-blur-[0.5px] md:p-6">
          <div className="max-w-5xl space-y-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#AEB6FF]/70">
              BRANESx
            </p>

            <h1 className="text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">
              {headline}
            </h1>

            <p className="max-w-3xl text-sm leading-7 text-white/48 md:text-base">
              {subcopy}
            </p>

            <div className="rounded-[0.8rem] border border-[#AEB6FF]/14 bg-[#AEB6FF]/[0.025] px-4 py-3 text-sm text-white/70">
              Access changes what GEORGE can restore, remember, and support in real time.
            </div>


            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={redeemFounderCode}
                className="rounded-[0.7rem] border border-white/[0.055] bg-white/[0.012] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/58 transition hover:border-[#AEB6FF]/18 hover:bg-white/[0.018] hover:text-white/74"
              >
                Founder Code
              </button>

              <span className="text-[11px] tracking-[0.08em] text-white/30">
                Founder access restores local runtime entitlement.
              </span>
            </div>

            <div className="grid gap-3 pt-2 lg:grid-cols-4">
              <div className="rounded-[0.9rem] border border-white/[0.045] bg-white/[0.012] p-5 shadow-none">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white/88">Smart</p>
                  <span className="rounded-[0.6rem] border border-white/[0.045] bg-white/[0.018] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/48">
                    Base
                  </span>
                </div>
                <div className="mb-3 text-2xl font-semibold tracking-tight text-white/88">$0</div>
                <ul className="space-y-2 text-sm leading-6 text-white/46">
                  <li>Clarify what matters</li>
                  <li>Reduce drift and confusion</li>
                  <li>Light operational guidance</li>
                  <li>Anonymous access</li>
                </ul>
              </div>

              <div className="rounded-[0.9rem] border border-[#AEB6FF]/16 bg-[#AEB6FF]/[0.025] p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white/88">Intelligent</p>
                  <span className="rounded-[0.6rem] border border-[#AEB6FF]/16 bg-white/[0.012] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#D7DDFF]/58">
                    Continuity
                  </span>
                </div>
                <div className="mb-3 text-2xl font-semibold tracking-tight text-white/88"><span className="mb-3 text-2xl font-semibold tracking-tight text-white/88">$10</span></div>
                <ul className="space-y-2 text-sm leading-6 text-white/48">
                  <li>Expanded continuity</li>
                  <li>Stronger execution support</li>
                  <li>Better pressure handling</li>
                  <li>More runtime access</li>
                </ul>
                <button
                  type="button"
                  onClick={() => startCheckout('intelligent')}
                  className="mt-5 w-full rounded-[0.7rem] border border-[#AEB6FF]/18 bg-white/[0.012] px-4 py-3 text-sm font-semibold text-white/76 transition hover:border-[#AEB6FF]/28 hover:bg-[#AEB6FF]/[0.035]"
                >
                  Select Intelligent
                </button>
              </div>

              <div className="rounded-[0.9rem] border border-[#AEB6FF]/18 bg-[#10131B]/46 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white/90">Brilliant</p>
                  <span className="rounded-[0.6rem] border border-white/[0.05] bg-white/[0.014] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/50">
                    LIVE
                  </span>
                </div>
                <div className="mb-3 text-2xl font-semibold tracking-tight text-white/90">$25</div>
                <ul className="space-y-2 text-sm leading-6 text-white/50">
                  <li>Real-time LIVE support</li>
                  <li>Timing and pressure awareness</li>
                  <li>Repeatable lines and cues</li>
                  <li>Strongest continuity</li>
                </ul>
                <button
                  type="button"
                  onClick={() => startCheckout('brilliant_day')}
                  className="mt-5 w-full rounded-[0.7rem] border border-[#AEB6FF]/22 bg-[#AEB6FF]/[0.07] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#AEB6FF]/34 hover:bg-[#AEB6FF]/[0.095]"
                >
                  Select Brilliant
                </button>
              </div>

              <div className="rounded-[0.9rem] border border-white/[0.045] bg-white/[0.012] p-5 shadow-none">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white/88">Brilliant Day</p>
                  <span className="rounded-[0.6rem] border border-white/[0.045] bg-white/[0.014] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/46">
                    Temporary
                  </span>
                </div>
                <div className="mb-3 text-2xl font-semibold tracking-tight text-white/88">$5</div>
                <ul className="space-y-2 text-sm leading-6 text-white/46">
                  <li>Temporary Brilliant access</li>
                  <li>Interviews and negotiations</li>
                  <li>Calls and difficult rooms</li>
                  <li>LIVE when the moment matters</li>
                </ul>
                <button
                  type="button"
                  onClick={() => startCheckout('brilliant')}
                  className="mt-5 w-full rounded-[0.7rem] border border-white/[0.07] bg-white/[0.018] px-4 py-3 text-sm font-semibold text-white/74 transition hover:border-[#AEB6FF]/22 hover:bg-white/[0.026] hover:text-white/86"
                >
                  Select Day Access
                </button>
              </div>
            </div>

            
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div id="feedback" className="scroll-mt-24 rounded-[0.9rem] border border-white/[0.04] bg-white/[0.012] p-5">
            <div className="space-y-4">
              <p className="text-sm font-medium text-white/84">Feedback</p>
              <p className="text-sm leading-7 text-white/44">
                Note what feels confusing, useful, missing, or worth tightening.
              </p>

              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full rounded-[0.85rem] border border-white/[0.05] bg-[#10131B]/58 px-4 py-3 text-white outline-none"
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
                className="w-full rounded-[0.85rem] border border-white/[0.05] bg-[#10131B]/58 px-4 py-3 text-white outline-none placeholder:text-white/28"
              />

              <button
                type="button"
                onClick={submitFeedback}
                className="w-full rounded-[0.7rem] border border-white/[0.055] px-5 py-3 text-sm font-medium text-white/72 transition hover:border-[#AEB6FF]/22 hover:text-white/86"
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
