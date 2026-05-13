'use client'

type LiveChooserProps = {
  open: boolean
  hasAccess?: boolean
  onClose: () => void
  onStartLiveConversation: () => void
  onResumeLiveConversation: () => void
  onUpgrade?: () => void
  onEnterCode?: () => void
}

export default function LiveChooser({
  open,
  hasAccess = false,
  onClose,
  onStartLiveConversation,
  onResumeLiveConversation,
  onUpgrade,
  onEnterCode,
}: LiveChooserProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/72 px-4 backdrop-blur-[10px]">

      <div className="relative w-full max-w-[720px] overflow-hidden rounded-[1.2rem] border border-white/[0.05] bg-[#06070A]">

        <img
          src="/landing/city02.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.18]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,10,0.72)_0%,rgba(6,7,10,0.92)_100%)]" />

        <div className="relative z-10 flex flex-col items-center px-6 py-10 text-center">

          <img
            src="/bxx34.png"
            alt="BRANESx"
            className="mb-5 h-8 w-auto object-contain opacity-70"
          />

          <div className="mb-2 text-[10px] tracking-[0.22em] text-white/30">
            OPERATIONAL FLUENCY
          </div>

          <h2 className="text-[28px] font-semibold tracking-[-0.045em] text-white md:text-[40px]">
            GEORGE LIVE
          </h2>

          <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-white/62">
            Take advantage of advanced runtime logic and take GEORGE LIVE anywhere.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] tracking-[0.14em] text-white/40 md:text-[12px]">
            <span>INTERVIEWS</span>
            <span>•</span>
            <span>BOARDROOMS</span>
            <span>•</span>
            <span>CLASSROOMS</span>
            <span>•</span>
            <span>SALES</span>
            <span>•</span>
            <span>NEGOTIATIONS</span>
            <span>•</span>
            <span>APPOINTMENTS</span>
            <span>•</span>
            <span>EVERYDAY CONVERSATION</span>
          </div>

          <p className="mt-6 max-w-[620px] text-[14px] leading-7 text-white/48">
            Upload your résumé. Prepare for the room. Adapt in real time.
            The more context GEORGE has, the sharper the assistance becomes.
          </p>

          {hasAccess ? (
            <div className="mt-8 flex w-full max-w-[440px] flex-col gap-3">

              <button
                type="button"
                onClick={onStartLiveConversation}
                className="rounded-[1rem] bg-white px-6 py-4 text-[15px] font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
              >
                New LIVE Session
              </button>

              <button
                type="button"
                onClick={onResumeLiveConversation}
                className="rounded-[1rem] border border-[#7C8CFF]/18 bg-[#7C8CFF]/[0.08] px-6 py-4 text-[15px] font-semibold text-[#D7DDFF] transition hover:bg-[#7C8CFF]/[0.14] hover:text-white"
              >
                Resume LIVE
              </button>

            </div>
          ) : (
            <div className="mt-8 flex w-full max-w-[440px] flex-col gap-3">

              <button
                type="button"
                onClick={onUpgrade}
                className="rounded-[1rem] bg-white px-6 py-4 text-[15px] font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
              >
                Upgrade — From $10
              </button>

              <button
                type="button"
                onClick={onEnterCode}
                className="rounded-[1rem] border border-[#7C8CFF]/18 bg-[#7C8CFF]/[0.08] px-6 py-4 text-[15px] font-semibold text-[#D7DDFF] transition hover:bg-[#7C8CFF]/[0.14] hover:text-white"
              >
                Enter Access Code
              </button>

            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-6 text-[11px] tracking-[0.18em] text-white/34 transition hover:text-white/62"
          >
            CLOSE
          </button>

        </div>
      </div>
    </div>
  )
}
