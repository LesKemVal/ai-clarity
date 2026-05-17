'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getActiveSessionForMode } from '@/lib/george/session/store'

const ROOM_CONTROLS: Record<string, string[]> = {
  Interview: ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  Meeting: ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  Boardroom: ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  Negotiation: ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  Debate: ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  'Sales Call': ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  'Doctor Appointment': ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  Presentation: ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
  'Everyday Conversation': ['hmm', 'right', 'ok', 'let me think', 'why don’t we'],
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

      <div className="relative z-10 mx-auto flex w-full max-w-[760px] flex-col items-center px-5 text-center">
        <img
          src="/logofav.png"
          alt="BRANESx"
          className="mb-8 h-[128px] w-[220px] object-contain opacity-95"
        />

        <div className="mb-3 text-[10px] font-medium tracking-[0.3em] text-[#B8D4E6]/42">
          LIVE RUNTIME
        </div>

        <p className="mb-6 text-[16px] tracking-[-0.015em] text-white/70">
          Because often, the conversation <span className="font-semibold text-white/86">is</span> the work.
        </p>

        <h1 className="text-[34px] font-semibold tracking-[-0.052em] text-white md:text-[56px]">
          Prepare the room.
        </h1>

        <p className="mt-4 max-w-[590px] text-[14px] leading-6 text-white/54 md:text-[16px]">
          Configure LIVE before the room starts.
        </p>

        <div className="mt-7 w-full max-w-[640px] rounded-[1.1rem] border border-[#8FB6C9]/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.010))] p-5 text-left shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 text-[11px] tracking-[0.18em] text-white/34">
            <span>ROOM</span>
            <span className="text-[#B8D4E6]/42">OPTIONAL</span>
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
                      ? 'border-[#8FB6C9]/[0.22] bg-[#8FB6C9]/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                      : 'border-white/[0.055] bg-black/20 text-white/54 hover:border-[#8FB6C9]/[0.16] hover:bg-[#8FB6C9]/[0.04] hover:text-white/80'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>

          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Outcome, pressure, timing, risk, or what matters most in the room."
            rows={3}
            className="mt-5 w-full resize-none rounded-[0.9rem] border border-white/[0.055] bg-black/22 px-4 py-3 text-[14px] leading-6 text-white/82 outline-none placeholder:text-white/22 transition focus:border-[#8FB6C9]/[0.18]"
          />
        </div>

        <div className="mt-5 grid w-full max-w-[420px] gap-3">
          {(currentTier === 'intelligent' || currentTier === 'brilliant') ? (
            <>
              {hasLiveSession && (
                <Link
                  href="/george/live"
                  className="flex items-center justify-center rounded-[1rem] border border-white/[0.065] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] px-6 py-4 text-[14px] font-medium text-white/74 transition-all duration-150 hover:border-white/[0.11] hover:bg-white/[0.04] hover:text-white"
                >
                  Resume runtime
                </Link>
              )}

              <button
                type="button"
                onClick={prepareLive}
                className="relative overflow-hidden rounded-[1rem] border border-[#8FB6C9]/[0.22] bg-[linear-gradient(180deg,rgba(143,182,201,0.12),rgba(8,17,29,0.78))] px-6 py-4 text-[15px] font-semibold text-[#E6F3FA]/92 shadow-[0_18px_44px_rgba(4,10,18,0.28),inset_0_1px_0_rgba(143,182,201,0.08)] transition hover:border-[#8FB6C9]/[0.34] hover:text-white"
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(143,182,201,0.18),transparent_42%)] opacity-80" />
                <span className="relative">Enter LIVE</span>
              </button>

              <Link
                href="/george/live"
                className="flex items-center justify-center rounded-[1rem] border border-white/[0.06] bg-white/[0.012] px-6 py-4 text-[14px] font-medium text-white/50 transition-all duration-150 hover:border-white/[0.10] hover:bg-white/[0.022] hover:text-white/74"
              >
                Start without setup
              </Link>
            </>
          ) : (
            <Link
              href="/top-up"
              className="flex items-center justify-center rounded-[1rem] bg-white px-6 py-4 text-[15px] font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
            >
              Unlock LIVE
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
