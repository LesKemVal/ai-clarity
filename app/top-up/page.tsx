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
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[0.9rem] border border-white/[0.04] bg-white/[0.012] p-5 md:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[132px] overflow-hidden bg-[linear-gradient(135deg,rgba(174,182,255,0.09),rgba(16,69,91,0.10)_42%,transparent_72%)] md:h-[156px]">
            <div className="absolute -right-[18%] -top-[118px] h-[210px] w-[78%] rotate-[-7deg] rounded-[999px] border-t border-[#B9E8FF]/28 bg-[#6BD9EA]/[0.10] blur-[0.2px]" />
            <div className="absolute -right-[10%] -top-[94px] h-[190px] w-[72%] rotate-[-7deg] rounded-[999px] border-t border-[#AEB6FF]/24 bg-[#2C82A4]/[0.12]" />
            <div className="absolute -right-[2%] -top-[74px] h-[160px] w-[62%] rotate-[-7deg] rounded-[999px] border-t border-[#D7DDFF]/18 bg-[#173B5A]/[0.18]" />
            <div className="absolute right-[8%] top-[20px] h-[5px] w-[28%] rotate-[-7deg] rounded-full bg-[#9CCD3F]/70 shadow-[0_0_22px_rgba(156,205,63,0.18)]" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-[#0B0D12]/78" />
          </div>

          <div className="relative z-10 max-w-5xl space-y-5 pt-14 md:pt-16">
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
                <div className="mb-3 text-2xl font-semibold tracking-tight text-white/88">$9.99</div>
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
