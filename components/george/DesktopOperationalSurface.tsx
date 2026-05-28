export default function DesktopOperationalSurface({
  visible,
  mode = 'idle',
}: {
  visible: boolean
  mode?: 'idle' | 'active'
}) {
  if (!visible) return null

  if (mode !== 'active') {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-[112px] bottom-[250px] z-[18] hidden items-center justify-center md:flex">
        <div className="relative w-full max-w-[980px] px-10 opacity-92 transition-opacity duration-500">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.088),transparent_58%)]" />

          <div className="relative text-center">
            <div className="text-[92px] font-[260] tracking-[0.34em] text-[#D7DBE4]/[0.065]">
              GEORGE
            </div>

            <div className="mt-5 text-[15px] font-light tracking-[0.12em] text-[#D7DBE4]/42">
              Bring the situation. GEORGE helps you find the next useful move.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[96px] bottom-[198px] z-[18] overflow-hidden bg-[#05070A]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(95,125,190,0.05),transparent_70%)]" />
      <div className="absolute -left-[35%] top-0 h-full w-[40%] animate-[desktopShimmer_12s_linear_infinite] bg-gradient-to-r from-transparent via-white/[0.018] to-transparent blur-[32px]" />

      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <div className="w-full max-w-[640px] -translate-y-4">
          <div className="mx-auto mb-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.055] bg-black/22 text-[11px] font-semibold tracking-[-0.02em] text-[#D7DBE4]/56 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
            Bx
          </div>

          <div className="text-[12px] uppercase tracking-[0.30em] text-[#8FB6C9]/54">
            NORMAL GEORGE
          </div>

          <div className="mx-auto mt-5 max-w-[520px] text-[18px] font-light leading-8 tracking-[-0.02em] text-[#D7DBE4]/64">
            Ask GEORGE what to say, what to do next, how to think through it, or how to move without losing the thread.
          </div>

          <div className="mx-auto mt-8 grid max-w-[560px] gap-3 text-left">
            {[
              ['Bring the situation', 'Describe what is happening. GEORGE will help separate what matters from noise.'],
              ['Ask for the next move', 'Use GEORGE for decisions, planning, replies, preparation, pressure, and execution.'],
              ['Use LIVE when it is active', 'When the conversation is happening in real time, LIVE can help with pacing, wording, and timing.'],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-[1.05rem] border border-white/[0.04] bg-black/16 px-4 py-3.5 shadow-[0_16px_42px_rgba(0,0,0,0.14)]"
              >
                <div className="text-[10px] uppercase tracking-[0.22em] text-[#8FB6C9]/54">
                  {title}
                </div>

                <div className="mt-2 text-[13px] leading-6 text-[#D7DBE4]/44">
                  {body}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-7 max-w-[500px] text-[12px] leading-6 text-[#D7DBE4]/30">
            This space appears while you are starting. Once you send, GEORGE replaces it with the conversation.
          </div>
        </div>
      </div>
    </div>
  )
}
