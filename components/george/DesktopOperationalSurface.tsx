export default function DesktopOperationalSurface({
  visible,
  mode = 'idle',
}: {
  visible: boolean
  mode?: 'idle' | 'active'
}) {
  if (!visible) return null

  if (mode === 'active') {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-[132px] bottom-[178px] z-[18] hidden items-end justify-center md:flex">
        <div className="relative w-full max-w-[920px] px-10 pb-12">
          <div className="absolute inset-x-10 bottom-0 h-[180px] rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.045),transparent_64%)]" />

          <div className="relative mx-auto rounded-[1.25rem] border border-[#8FB6C9]/[0.045] bg-[#08111D]/[0.22] px-7 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-[10px]">
            <div className="mb-4 flex items-center justify-between gap-5 border-b border-[#8FB6C9]/[0.055] pb-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#8FB6C9]/45">
                  GEORGE operational guide
                </div>
                <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/34">
                  Use the space clearly. GEORGE serves the direction you give it.
                </div>
              </div>

              <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/24">
                Direction → Context → Move
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5 text-left">
              <div className="rounded-[1rem] border border-white/[0.035] bg-black/18 px-4 py-3">
                <div className="text-[12px] font-medium text-[#D7DBE4]/58">1. State the direction</div>
                <p className="mt-1.5 text-[11px] leading-5 text-[#D7DBE4]/30">
                  Tell GEORGE what you want to build, decide, finish, fix, become, or prepare for.
                </p>
              </div>

              <div className="rounded-[1rem] border border-white/[0.035] bg-black/18 px-4 py-3">
                <div className="text-[12px] font-medium text-[#D7DBE4]/58">2. Add useful pressure</div>
                <p className="mt-1.5 text-[11px] leading-5 text-[#D7DBE4]/30">
                  Share timing, constraints, documents, people involved, risk, leverage, or what cannot be missed.
                </p>
              </div>

              <div className="rounded-[1rem] border border-white/[0.035] bg-black/18 px-4 py-3">
                <div className="text-[12px] font-medium text-[#D7DBE4]/58">3. Let GEORGE narrow</div>
                <p className="mt-1.5 text-[11px] leading-5 text-[#D7DBE4]/30">
                  GEORGE can draft, sequence, prepare, reframe, review, or move you to the next useful step.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.22em] text-[#8FB6C9]/36">
              <span>emails</span>
              <span>pitch decks</span>
              <span>negotiation</span>
              <span>documents</span>
              <span>career moves</span>
              <span>funding</span>
              <span>execution plans</span>
              <span className="inline-flex items-center gap-1.5">
                <img src="/newearbudicon.png" alt="" className="h-[13px] w-[13px] object-contain opacity-55" />
                live pressure
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[142px] bottom-[180px] z-[18] hidden items-center justify-center md:flex">
      <div className="relative w-full max-w-[980px] px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.08),transparent_58%)]" />

        <div className="relative text-center transition-opacity duration-500">
          <div className="text-[82px] font-[260] tracking-[0.34em] text-[#D7DBE4]/[0.045]">
            GEORGE
          </div>

          <div className="mt-4 text-[15px] font-light tracking-[0.12em] text-[#D7DBE4]/26">
            Direction sharpens when the room becomes real.
          </div>

          <div className="mx-auto mt-10 max-w-[820px] text-[17px] font-[300] leading-[1.8] tracking-[0.02em] text-[#D7DBE4]/16">
            Build carefully. Move deliberately. Let pressure reveal structure instead of fear.
          </div>

          <div className="mx-auto mt-12 flex max-w-[860px] flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[10px] uppercase tracking-[0.24em] text-[#8FB6C9]/34">
            <span>trajectory awareness</span>
            <span>room pressure</span>
            <span>execution sequencing</span>
            <span>response shaping</span>
            <span>continuity memory</span>
            <span>operational recall</span>
          </div>
        </div>
      </div>
    </div>
  )
}
