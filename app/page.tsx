'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import LiveChooser from '@/components/george/LiveChooser'
import { getSessionsForMode, hasMeaningfulUserMessage } from '@/lib/george/session/store'

export default function HomePage() {
  const router = useRouter()
  const [active, setActive] = useState<'normal' | 'live' | null>(null)
  const [liveLaunching, setLiveLaunching] = useState(false)
  const [showLiveChooser, setShowLiveChooser] = useState(false)
  const [currentTier, setCurrentTier] = useState<'smart' | 'intelligent' | 'brilliant'>('smart')
  const [liveSessionSignal, setLiveSessionSignal] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedTier = window.localStorage.getItem('george_tier')
    if (savedTier === 'smart' || savedTier === 'intelligent' || savedTier === 'brilliant') {
      setCurrentTier(savedTier)
    }

    let cancelled = false

    fetch('/api/session', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return

        if (data?.tier === 'smart' || data?.tier === 'intelligent' || data?.tier === 'brilliant') {
          setCurrentTier(data.tier)
          window.localStorage.setItem('george_tier', data.tier)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const hasLiveSession = useMemo(() => {
    if (typeof window === 'undefined') return false

    try {
      return getSessionsForMode('live').some((session) =>
        hasMeaningfulUserMessage(session.messages || [])
      )
    } catch {
      return false
    }
  }, [liveSessionSignal])

  const openLiveChooser = () => {
    if (liveLaunching) return
    setActive('live')
    setLiveLaunching(true)
    window.setTimeout(() => {
      setLiveSessionSignal((value) => value + 1)
      setShowLiveChooser(true)
    }, 720)
  }

  const closeLiveChooser = () => {
    setShowLiveChooser(false)
    setLiveLaunching(false)
    setActive(null)
  }

  const startNewLiveConversation = () => {
    window.localStorage.setItem('george_fresh_live_entry', '1')
    window.localStorage.removeItem('GEORGE_LIVE_SETUP')
    window.localStorage.removeItem('george_live_control_words')
    window.localStorage.removeItem('george_live_runtime_support')
    window.localStorage.removeItem('george_live_estimated_cents')
    window.localStorage.removeItem('george_active_live_session_id')
    window.localStorage.removeItem('george_active_campaign_session_id')
    window.localStorage.removeItem('george_active_campaign')
    window.localStorage.removeItem('george_active_context')
    window.localStorage.removeItem('george_active_label')
    window.localStorage.setItem('george_open_live_chooser_after_home', '1')
    router.push('/george')
  }

  const resumeLiveConversation = () => {
    window.localStorage.setItem('george_resume_live_after_home', '1')
    router.push('/george')
  }

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#040507] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(120,140,170,0.08),transparent_32%),linear-gradient(180deg,rgba(4,5,7,0.78),rgba(4,5,7,0.94))]" />

        <div
          className={`absolute inset-0 transition duration-700 ${
            active === 'live'
              ? 'bg-[#020304]/42'
              : active === 'normal'
                ? 'bg-[#091018]/18'
                : 'bg-transparent'
          }`}
        />

        <div className="absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.015] blur-3xl" />
      </div>

      <style jsx>{`
        @keyframes liveEntryPulse {
          0%, 100% { box-shadow: 0 20px 70px rgba(0,0,0,0.38); border-color: rgba(255,255,255,0.05); }
          18% { box-shadow: 0 0 0 1px rgba(143,182,255,0.24), 0 0 42px rgba(143,182,255,0.22); border-color: rgba(143,182,255,0.34); transform: scale(1.01); }
          48% { box-shadow: 0 20px 70px rgba(0,0,0,0.38); border-color: rgba(255,255,255,0.05); }
          66% { box-shadow: 0 0 0 1px rgba(143,182,255,0.26), 0 0 46px rgba(143,182,255,0.24); border-color: rgba(143,182,255,0.38); transform: scale(1.012); }
        }
      `}</style>

      <section className="relative z-10 flex w-full max-w-[760px] flex-col items-center px-8 text-center">
        <div className="mb-8">
          <img
            src="/logofav.png"
            alt="Bx"
            className={`mx-auto h-20 w-20 object-contain transition duration-700 ${
              active ? 'scale-[1.02] opacity-100' : 'opacity-[0.92]'
            }`}
          />

          <div className="mt-5 text-[12px] uppercase tracking-[0.42em] text-white/58">
            BRANESx
          </div>
        </div>

        <div className="max-w-[460px] text-[15px] leading-7 text-white/42">
          Operational intelligence for thinking clearly, moving deliberately, and handling moments where words matter.
        </div>

        <div className="mt-16 flex w-full max-w-[520px] flex-col gap-5">
          <Link
            href="/george"
            onMouseEnter={() => setActive('normal')}
            onMouseLeave={() => setActive(null)}
            onTouchStart={() => setActive('normal')}
            className="group relative overflow-hidden rounded-[1.4rem] border border-white/[0.045] bg-white/[0.02] px-6 py-5 transition duration-500 active:scale-[0.992]"
          >
            <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
              <div className="absolute inset-y-0 left-[-35%] w-[40%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent blur-xl transition-all duration-1000 group-hover:left-[120%]" />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="text-left">
                <div className="text-[12px] uppercase tracking-[0.34em] text-white/76">
                  NORMAL
                </div>

                <div className="mt-2 text-[14px] leading-6 text-white/40">
                  Think, decide, prepare, build.
                </div>
              </div>

              <div className="text-[12px] tracking-[0.24em] text-white/24 transition duration-300 group-hover:text-white/58">
                GEORGE
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={openLiveChooser}
            onMouseEnter={() => setActive('live')}
            onMouseLeave={() => {
              if (!liveLaunching) setActive(null)
            }}
            onTouchStart={() => setActive('live')}
            className={`group relative overflow-hidden rounded-[1.4rem] border border-white/[0.05] bg-[#0A1016]/32 px-6 py-5 text-left transition duration-500 active:scale-[0.992] ${
              liveLaunching ? 'animate-[liveEntryPulse_980ms_cubic-bezier(0.22,1,0.36,1)_1]' : ''
            }`}
          >
            <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
              <div className="absolute inset-y-0 left-[-35%] w-[40%] rotate-[18deg] bg-gradient-to-r from-transparent via-[#B7D4E8]/[0.08] to-transparent blur-xl transition-all duration-1000 group-hover:left-[120%]" />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="text-left">
                <div className="text-[12px] uppercase tracking-[0.34em] text-white/82">
                  LIVE
                </div>

                <div className="mt-2 text-[14px] leading-6 text-white/42">
                  Bring GEORGE into the room.
                </div>
              </div>

              <div className="text-[12px] tracking-[0.24em] text-white/24 transition duration-300 group-hover:text-white/62">
                ACTIVE
              </div>
            </div>
          </button>
        </div>

        <div className="mt-14 text-[10px] uppercase tracking-[0.28em] text-white/18">
          Direction → Action → Signal
        </div>
      </section>

      <LiveChooser
        open={showLiveChooser}
        hasAccess={currentTier === 'brilliant'}
        hasLiveSession={hasLiveSession}
        onClose={closeLiveChooser}
        onStartLiveConversation={startNewLiveConversation}
        onResumeLiveConversation={resumeLiveConversation}
        onUpgrade={() => router.push('/top-up')}
        onEnterCode={() => router.push('/george')}
      />
    </main>
  )
}
