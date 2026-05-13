'use client'

type LiveChooserProps = {
  open: boolean
  hasAccess?: boolean
  hasLiveSession?: boolean
  onClose: () => void
  onStartLiveConversation: () => void
  onResumeLiveConversation: () => void
  onUpgrade?: () => void
  onEnterCode?: () => void
}

export default function LiveChooser({
  open,
  hasAccess = false,
  hasLiveSession = false,
  onClose,
  onStartLiveConversation,
  onResumeLiveConversation,
  onUpgrade,
  onEnterCode,
}: LiveChooserProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/72 px-4 backdrop-blur-[8px]">

      <div className="relative w-full max-w-[680px] overflow-hidden rounded-[1rem] border border-white/[0.05] bg-[#06070A]">

        <img
          src="/landing/city02.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.14]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,10,0.74)_0%,rgba(6,7,10,0.94)_100%)]" />

        <div className="relative z-10 flex flex-col items-center px-6 py-8 text-center">

          <img
            src="/bxx34.png"
            alt="BRANESx"
            className="mb-4 h-7 w-auto object-contain opacity-64"
          />

          <div className="mb-2 text-[10px] tracking-[0.22em] text-white/28">
            OPERATIONAL FLUENCY
          </div>

          <h2 className="text-[26px] font-semibold tracking-[-0.045em] text-white md:text-[36px]">
            GEORGE LIVE
          </h2>

          <p className="mt-3 max-w-[580px] text-[14px] leading-6 text-white/58">
            Take advantage of advanced runtime logic and take GEORGE LIVE anywhere.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-[10px] tracking-[0.14em] text-white/38 md:text-[11px]">
            <span>INTERVIEWS</span>
            <span>•</span>
            <span>BOARDROOMS</span>
            <span>•</span>
            <span>SALES</span>
            <span>•</span>
            <span>NEGOTIATIONS</span>
            <span>•</span>
            <span>CLASSROOMS</span>
            <span>•</span>
            <span>EVERYDAY CONVERSATION</span>
          </div>

          <p className="mt-5 max-w-[580px] text-[13px] leading-6 text-white/44">
            Upload your résumé. Prepare for the room. Adapt in real time.
          </p>

          {hasAccess ? (
            <div className="mt-7 flex w-full max-w-[420px] flex-col gap-2.5">

              <button
                type="button"
                onClick={onStartLiveConversation}
                className="rounded-[0.95rem] bg-white px-6 py-3.5 text-[14px] font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
              >
                New LIVE Session
              </button>

              {hasLiveSession && (
                <button
                  type="button"
                  onClick={onResumeLiveConversation}
                  className="rounded-[0.95rem] border border-[#7C8CFF]/18 bg-[#7C8CFF]/[0.08] px-6 py-3.5 text-[14px] font-semibold text-[#D7DDFF] transition hover:bg-[#7C8CFF]/[0.14] hover:text-white"
                >
                  Resume LIVE
                </button>
              )}

            </div>
          ) : (
            <div className="mt-7 flex w-full max-w-[420px] flex-col gap-2.5">

              <button
                type="button"
                onClick={onUpgrade}
                className="rounded-[0.95rem] bg-white px-6 py-3.5 text-[14px] font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
              >
                Upgrade — $10
              </button>

              <button
                type="button"
                onClick={onEnterCode}
                className="rounded-[0.95rem] border border-[#7C8CFF]/18 bg-[#7C8CFF]/[0.08] px-6 py-3.5 text-[14px] font-semibold text-[#D7DDFF] transition hover:bg-[#7C8CFF]/[0.14] hover:text-white"
              >
                Enter Access Code
              </button>

            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-5 text-[10px] tracking-[0.18em] text-white/30 transition hover:text-white/58"
          >
            CLOSE
          </button>

        </div>
      </div>
    </div>
  )
}
