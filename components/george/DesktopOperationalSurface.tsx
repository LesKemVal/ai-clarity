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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.06),transparent_58%)]" />

          <div className="relative text-center">
            <div className="text-[78px] font-[260] tracking-[0.28em] text-[#F4F7FF]/[0.05]">
              GEORGE
            </div>

            <div className="mt-5 text-[14px] font-light tracking-[0.08em] text-[#F4F7FF]/40">
              Bring the situation. GEORGE helps you think clearly, respond deliberately, and move without losing the thread.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[96px] bottom-[198px] z-[18] overflow-hidden bg-[#05070A]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(95,125,190,0.04),transparent_70%)]" />
      <div className="absolute -left-[35%] top-0 h-full w-[40%] animate-[desktopShimmer_12s_linear_infinite] bg-gradient-to-r from-transparent via-white/[0.014] to-transparent blur-[32px]" />

      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <div className="w-full max-w-[620px] -translate-y-4">
          <div className="mx-auto mb-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.04] bg-black/18 text-[11px] font-semibold tracking-[-0.02em] text-[#F4F7FF]/52 shadow-[0_14px_36px_rgba(0,0,0,0.18)]">
            Bx
          </div>

          <div className="text-[11px] uppercase tracking-[0.26em] text-[#F4F7FF]/42">
            NORMAL GEORGE
          </div>

          <div className="mx-auto mt-5 max-w-[520px] text-[18px] font-light leading-8 tracking-[-0.02em] text-[#F4F7FF]/70">
            Ask GEORGE what to say, what to do next, how to prepare, or how to think through something before pressure turns into confusion.
          </div>

          <div className="mx-auto mt-8 grid max-w-[540px] gap-2.5 text-left">
            {[
              ['Bring the situation', 'Describe what is happening. GEORGE helps separate what matters from noise.'],
              ['Ask for the next move', 'Use GEORGE for planning, replies, pressure, preparation, execution, and clarity under tension.'],
              ['Use LIVE when needed', 'When the conversation is already happening, LIVE helps with pacing, wording, timing, and conversational flow.'],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-[1rem] border border-white/[0.028] bg-black/12 px-4 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
              >
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#F4F7FF]/38">
                  {title}
                </div>

                <div className="mt-1.5 text-[13px] leading-6 text-[#F4F7FF]/48">
                  {body}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-7 max-w-[480px] text-[11px] leading-6 text-[#F4F7FF]/30">
            This operational surface disappears once the conversation begins.
          </div>
        </div>
      </div>
    </div>
  )
}
