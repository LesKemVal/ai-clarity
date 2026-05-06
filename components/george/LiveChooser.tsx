'use client'

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
  if (!open) return null

  return (
    <div className="fixed bottom-[168px] left-1/2 z-[95] w-[calc(100%-32px)] max-w-[520px] -translate-x-1/2 pointer-events-none">
      <div className="pointer-events-auto rounded-[1.15rem] border border-white/[0.08] bg-black/92 p-2 shadow-[0_18px_46px_rgba(0,0,0,0.46)] backdrop-blur-xl">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-[0.95rem] border border-[#7C8CFF]/18 bg-[#7C8CFF]/[0.055] p-2">
            <div className="mb-2 px-1">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#AEB6FF]">LIVE</p>
              <p className="mt-1 text-[11px] leading-snug text-white/46">Immediate conversation help.</p>
            </div>

            <button
              type="button"
              onClick={onStartLiveConversation}
              className="mb-1 w-full rounded-[0.8rem] border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-left text-[12px] font-medium text-white/78 transition hover:border-[#7C8CFF]/35 hover:bg-[#7C8CFF]/10 hover:text-white"
            >
              Start Conversation
            </button>

            <button
              type="button"
              onClick={onResumeLiveConversation}
              className="w-full rounded-[0.8rem] px-3 py-2 text-left text-[12px] font-medium text-white/50 transition hover:bg-white/[0.05] hover:text-white/78"
            >
              Resume Conversation
            </button>
          </div>

          <div className="rounded-[0.95rem] border border-white/[0.08] bg-white/[0.025] p-2">
            <div className="mb-2 px-1">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-white/68">PRO</p>
              <p className="mt-1 text-[11px] leading-snug text-white/42">Structured campaign workflow.</p>
            </div>

            <button
              type="button"
              onClick={onStartCampaign}
              className="mb-1 w-full rounded-[0.8rem] border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-left text-[12px] font-medium text-white/72 transition hover:border-[#7C8CFF]/30 hover:bg-white/[0.06] hover:text-white"
            >
              Start New Campaign
            </button>

            <button
              type="button"
              onClick={onResumeCampaign}
              className="w-full rounded-[0.8rem] px-3 py-2 text-left text-[12px] font-medium text-white/48 transition hover:bg-white/[0.05] hover:text-white/76"
            >
              Resume Campaign
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-[0.8rem] px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] text-white/36 transition hover:bg-white/[0.04] hover:text-white/64"
        >
          CLOSE
        </button>
      </div>
    </div>
  )
}
