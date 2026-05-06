'use client'

import { createPortal } from 'react-dom'

type LiveChooserProps = {
  open: boolean
  onClose: () => void
  onStartLiveConversation: () => void
  onResumeLiveConversation: () => void
  onStartCampaign: () => void
  onResumeCampaign: () => void
}

export default function LiveChooser({
  open,
  onClose,
  onStartLiveConversation,
  onResumeLiveConversation,
  onStartCampaign,
  onResumeCampaign,
}: LiveChooserProps) {
  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <>
      <style jsx global>{`
        @keyframes georgeCleanTrace {
          0% { border-color: rgba(124,140,255,0.22); }
          45% { border-color: rgba(124,140,255,0.9); }
          100% { border-color: rgba(255,255,255,0.10); }
        }
      `}</style>

      <div
        role="button"
        tabIndex={0}
        aria-label="Close LIVE chooser"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
            onClose()
          }
        }}
        className="pointer-events-auto fixed inset-0 z-[200] bg-black/40 backdrop-blur-[16px] backdrop-saturate-150"
      />

      <div className="pointer-events-none fixed left-0 right-0 top-5 z-[215] flex justify-center">
        <img
          src="/logo900.png"
          alt="BRANESx"
          className="h-10 w-auto object-contain opacity-70 drop-shadow-[0_0_18px_rgba(124,140,255,0.18)]"
        />
      </div>

      <div className="pointer-events-none fixed inset-0 z-[210] flex items-center justify-center px-4">
        <div className="pointer-events-auto relative w-full max-w-[760px] rounded-[1.5rem] border border-[#7C8CFF]/30 bg-[linear-gradient(180deg,rgba(23,23,28,0.98),rgba(5,5,8,0.98))] p-5 shadow-[0_26px_80px_rgba(0,0,0,0.72),0_0_36px_rgba(124,140,255,0.14)] backdrop-blur-2xl">
          <button
            type="button"
            aria-label="Close LIVE chooser"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white transition hover:border-[#7C8CFF]"
          >
            ×
          </button>

          <div className="pr-10">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#7C8CFF]">
              LIVE
            </div>
            <div className="mt-2 text-[16px] font-semibold text-white">
              Choose the kind of live help.
            </div>
            <div className="mt-2 text-[12px] leading-5 text-white/50">
              LIVE Conversation is immediate and adaptive. Pro LIVE Campaign is structured, named, and campaign-aware.
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.8rem] bg-[#7C8CFF]/[0.045] p-5" style={{ animation: 'georgeCleanTrace 420ms ease-out 0s 1' }}>
              <div className="text-[12px] font-semibold tracking-[0.14em] text-[#AEB6FF]">
                LIVE Conversation
              </div>
              <div className="mt-2 text-[12px] leading-5 text-white/55">
                For personal conversations, pressure moments, doctors, lawyers, negotiations, interviews, or real-time wording help.
              </div>

              <button
                type="button"
                onClick={onStartLiveConversation}
                className="mt-4 w-full rounded-xl border border-[#7C8CFF]/35 bg-[#7C8CFF]/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-[#7C8CFF]/20"
              >
                Start LIVE Conversation
              </button>

              <button
                type="button"
                onClick={onResumeLiveConversation}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-left text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
              >
                Resume LIVE Conversation
              </button>
            </div>

            <div className="rounded-[1.8rem] bg-white/[0.025] p-5" style={{ animation: 'georgeCleanTrace 420ms ease-out 0s 1' }}>
              <div className="text-[12px] font-semibold tracking-[0.14em] text-white/80">
                PRO LIVE Campaign
              </div>
              <div className="mt-2 text-[12px] leading-5 text-white/50">
                For structured professional calls, campaigns, scripts, objections, outcomes, data capture, and repeatable workflows.
              </div>

              <button
                type="button"
                onClick={onStartCampaign}
                className="mt-4 w-full rounded-xl border border-[#7C8CFF]/25 bg-white/[0.035] px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-[#7C8CFF]/10"
              >
                Start Campaign
              </button>

              <button
                type="button"
                onClick={onResumeCampaign}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-left text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
              >
                Resume Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
