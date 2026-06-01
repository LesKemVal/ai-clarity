'use client'

import type { PrepRoomResourceProfile } from '@/lib/george/prep-room/resources'

type Props = {
  open: boolean
  profile: PrepRoomResourceProfile | null
  room?: string
  relatedSessionTitle?: string | null
  chairs?: string[]
  desiredOutcome?: string
  knownContext?: string
  assistMode?: string
  signals?: string[]
  onClose: () => void
  onEnterLive?: () => void
  onEditResource?: <K extends keyof PrepRoomResourceProfile>(key: K, value: PrepRoomResourceProfile[K]) => void
}

function formatValue(value: string) {
  return value.replace(/_/g, ' ')
}

export function PrepRoomResourcePopup({ open, profile, room, relatedSessionTitle, chairs = [], desiredOutcome, knownContext, assistMode, signals = [], onClose, onEnterLive }: Props) {
  if (!open || !profile) return null

  const roomValue = room?.trim() || profile.roomType || 'LIVE conversation'
  const relatedSessionValue = relatedSessionTitle?.trim() || 'Not related'
  const chairValue = chairs.length ? chairs.join(' + ') : 'Not specified'
  const desiredOutcomeValue = desiredOutcome?.trim() || 'Not specified'
  const knownContextValue = knownContext?.trim() || 'Not specified'
  const assistValue = assistMode?.trim() || formatValue(profile.responseTexture)
  const summaryLine = `GEORGE will enter LIVE using your position, outcome, and observed reality to decide what matters first.`

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
      `}</style>

      <div className="relative flex max-h-[min(440px,calc(100dvh-22px))] w-full max-w-[470px] flex-col overflow-hidden rounded-[1rem] border border-white/[0.07] bg-[#05080D]/94 shadow-[0_22px_70px_rgba(0,0,0,0.52)] backdrop-blur-xl transition duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(143,182,255,0.105),transparent_36%)] opacity-80" />
        <div className="pointer-events-none absolute -inset-y-28 -left-1/2 w-[72%] animate-[prepShimmer_5.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#8FB6FF]/[0.075] to-transparent" />
        <div className="pointer-events-none absolute -inset-x-32 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative shrink-0 px-4 pb-3 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#8FB6C9]/52">GEORGE Summary</p>
              <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-0.045em] text-white">
                GEORGE is ready to enter LIVE.
              </h2>
            </div>
            <div className="rounded-full border border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.055] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/68">
              Ready
            </div>
          </div>

          <p className="mt-2 text-[12px] leading-5 text-white/50">
            Review what GEORGE will treat as the starting frame before the room opens.
          </p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div className="rounded-[0.82rem] border border-[#8FB6C9]/[0.09] bg-black/18 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/24">Starting frame</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/42">review</p>
            </div>

            <div className="mt-2 grid gap-2 text-[12px] leading-5 text-white/56">
              <p><span className="text-white/78">Related session:</span> {relatedSessionValue}</p>
              <p><span className="text-white/78">Your position:</span> {chairValue}</p>
              <p><span className="text-white/78">Desired outcome:</span> {desiredOutcomeValue}</p>
              <p><span className="text-white/78">Observed reality:</span> {knownContextValue}</p>
            </div>
          </div>

          <div className="mt-2 rounded-[0.9rem] border border-white/[0.055] bg-white/[0.018] px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/28">GEORGE will consider</p>
            <p className="mt-2 text-[12px] leading-5 text-white/48">
              {summaryLine}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full border border-white/[0.055] bg-black/20 px-2.5 py-1 text-[11px] text-white/48">
                {roomValue}
              </span>
              <span className="rounded-full border border-white/[0.055] bg-black/20 px-2.5 py-1 text-[11px] text-white/48">
                {assistValue}
              </span>
            </div>
          </div>
        </div>

        <div className="relative shrink-0 border-t border-white/10 bg-[#05080D]/94 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-1 py-1 text-[11px] uppercase tracking-[0.22em] text-white/30 transition duration-150 hover:text-white/62 active:scale-[0.96] active:text-white"
            >
              Close
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  window.localStorage.setItem('george_deploy_live_source', 'prep-room')
                  window.location.href = '/george/deploy-live'
                }}
                className="px-1 py-1 text-[11px] uppercase tracking-[0.18em] text-[#8FB6C9]/62 transition hover:text-[#D7DCFF]"
              >
                More signal
              </button>

              <button
                onClick={onEnterLive}
                className="animate-[liveDeployPulse_520ms_cubic-bezier(0.22,1,0.36,1)_1] rounded-[0.8rem] border border-[#8FB6C9]/[0.18] bg-[linear-gradient(180deg,rgba(18,28,38,0.92),rgba(5,8,13,0.98))] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#D7DCFF]/82 shadow-[0_12px_32px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-150 hover:border-[#8FB6C9]/[0.32] hover:text-white active:scale-[0.96]"
              >
                Start LIVE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
