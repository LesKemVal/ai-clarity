'use client'

import type { PrepRoomResourceProfile } from '@/lib/george/prep-room/resources'

type Props = {
  open: boolean
  profile: PrepRoomResourceProfile | null
  onClose: () => void
  onEnterLive?: () => void
  onEditResource?: <K extends keyof PrepRoomResourceProfile>(key: K, value: PrepRoomResourceProfile[K]) => void
}

type SteeringMap = {
  phrase: string
  behavior: string
}

const STEERING_MAP: SteeringMap[] = [
  {
    phrase: 'let me think...',
    behavior: 'buy time / slow pacing',
  },
  {
    phrase: 'ok, and...',
    behavior: 'continue / next move',
  },
  {
    phrase: 'fair point...',
    behavior: 'soften before redirect',
  },
  {
    phrase: 'what I mean is...',
    behavior: 'reframe the sentence',
  },
  {
    phrase: 'let’s be clear...',
    behavior: 'firmer posture / compression',
  },
]

function formatValue(value: string) {
  return value.replace(/_/g, ' ')
}

export function PrepRoomResourcePopup({ open, profile, onClose, onEnterLive }: Props) {
  if (!open || !profile) return null

  const runtimeSummary = [
    formatValue(profile.recommendedPosture),
    formatValue(profile.cadence),
    formatValue(profile.compression),
    formatValue(profile.cueDensity),
  ].join(' · ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/52 px-3 py-4 backdrop-blur-[14px] transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]">
      <style jsx>{`
        @keyframes prepShimmer {
          0% { transform: translateX(-45%) rotate(12deg); opacity: 0; }
          20% { opacity: 0.7; }
          55% { opacity: 0.42; }
          100% { transform: translateX(215%) rotate(12deg); opacity: 0; }
        }

        @keyframes liveDeployPulse {
          0%, 100% { box-shadow: 0 12px 32px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.04); }
          22% { box-shadow: 0 0 0 1px rgba(143,182,255,0.26), 0 0 34px rgba(143,182,255,0.22), inset 0 1px 0 rgba(255,255,255,0.08); transform: scale(1.01); }
          50% { box-shadow: 0 12px 32px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.04); }
          76% { box-shadow: 0 0 0 1px rgba(143,182,255,0.30), 0 0 42px rgba(143,182,255,0.24), inset 0 1px 0 rgba(255,255,255,0.08); transform: scale(1.012); }
        }

        @keyframes runtimeMeterPulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(143,182,201,0.09), 0 10px 28px rgba(0,0,0,0.18); }
          22% { box-shadow: 0 0 0 1px rgba(143,182,255,0.28), 0 0 34px rgba(143,182,255,0.22), 0 10px 28px rgba(0,0,0,0.18); }
          50% { box-shadow: 0 0 0 1px rgba(143,182,201,0.09), 0 10px 28px rgba(0,0,0,0.18); }
          76% { box-shadow: 0 0 0 1px rgba(143,182,255,0.32), 0 0 42px rgba(143,182,255,0.24), 0 10px 28px rgba(0,0,0,0.18); }
        }
      `}</style>

      <div className="relative flex max-h-[min(510px,calc(100dvh-22px))] w-full max-w-[470px] flex-col overflow-hidden rounded-[1rem] border border-white/[0.07] bg-[#05080D]/94 shadow-[0_22px_70px_rgba(0,0,0,0.52)] backdrop-blur-xl transition duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(143,182,255,0.105),transparent_36%)] opacity-80" />
        <div className="pointer-events-none absolute -inset-y-28 -left-1/2 w-[72%] animate-[prepShimmer_5.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#8FB6FF]/[0.075] to-transparent" />
        <div className="pointer-events-none absolute -inset-x-32 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative shrink-0 px-4 pb-3 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#8FB6C9]/52">LIVE Preview</p>
              <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-0.045em] text-white">
                Steering behavior
              </h2>
            </div>
            <div className="rounded-full border border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.055] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/68">
              Runtime ready
            </div>
          </div>

          <p className="mt-2 text-[12px] leading-5 text-white/50">
            These phrases are natural sentence starters GEORGE uses to adjust timing, tone, cues and lines during the conversation.
          </p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div className="animate-[runtimeMeterPulse_620ms_1000ms_cubic-bezier(0.22,1,0.36,1)_2] rounded-[0.82rem] border border-[#8FB6C9]/[0.09] bg-black/24 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Runtime summary</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/58">GEORGE selected</p>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/46">
              <span>{formatValue(profile.pressureLevel)} pressure</span>
              <span>{formatValue(profile.cueDensity)} cues</span>
              <span>{formatValue(profile.compression)} compression</span>
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/34">{runtimeSummary}</p>
          </div>

          <div className="mt-3 rounded-[0.9rem] border border-white/[0.055] bg-white/[0.018] px-3 py-3">
            <div className="grid grid-cols-[1fr_18px_1.35fr] items-center gap-x-2 border-b border-white/[0.045] pb-2 text-[10px] uppercase tracking-[0.18em] text-white/30">
              <span>Phrase</span>
              <span />
              <span>Expected behavior</span>
            </div>

            <div className="divide-y divide-white/[0.035]">
              {STEERING_MAP.map((item) => (
                <div key={item.phrase} className="grid grid-cols-[1fr_18px_1.35fr] items-center gap-x-2 py-2">
                  <p className="text-[13px] font-medium tracking-[-0.02em] text-white/82">{item.phrase}</p>
                  <span className="h-px w-full bg-[#8FB6C9]/34" />
                  <p className="text-[11px] leading-4 text-white/46">{item.behavior}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-2 text-[11px] leading-4 text-white/34">
            Use the phrase naturally. GEORGE treats it as the beginning of the next cue or repeatable line.
          </p>
        </div>

        <div className="relative shrink-0 border-t border-white/10 bg-[#05080D]/94 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-1 py-1 text-[11px] uppercase tracking-[0.22em] text-white/30 transition duration-150 hover:text-white/62 active:scale-[0.96] active:text-white"
            >
              Close
            </button>
            <button
              onClick={onEnterLive}
              className="animate-[liveDeployPulse_520ms_cubic-bezier(0.22,1,0.36,1)_1] rounded-[0.8rem] border border-[#8FB6C9]/[0.18] bg-[linear-gradient(180deg,rgba(18,28,38,0.92),rgba(5,8,13,0.98))] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#D7DCFF]/82 shadow-[0_12px_32px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-150 hover:border-[#8FB6C9]/[0.32] hover:text-white active:scale-[0.96]"
            >
              Now start LIVE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
