export default function DesktopOperationalSurface({
  visible,
  mode = 'idle',
}: {
  visible: boolean
  mode?: 'idle' | 'active'
}) {
  if (!visible) return null

  if (mode === 'active') {
    const useCases = [
      ['Draft', 'emails, outreach, replies'],
      ['Build', 'plans, decks, workflows'],
      ['Review', 'docs, offers, context'],
      ['Prepare', 'interviews, calls, rooms'],
      ['Decide', 'tradeoffs, risk, next move'],
      ['Execute', 'sequence, simplify, finish'],
    ]

    return (
      <div className="pointer-events-none fixed inset-x-0 top-[124px] bottom-[178px] z-[18] hidden items-end justify-center md:flex">
        <div className="relative w-full max-w-[940px] px-10 pb-12 opacity-80 transition-opacity duration-500">
          <div className="absolute inset-x-10 bottom-0 h-[190px] rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.045),transparent_66%)]" />

          <div className="relative mx-auto rounded-[1.35rem] border border-[#8FB6C9]/[0.06] bg-[#08111D]/[0.32] px-7 py-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-[12px]">
            <div className="mb-4 flex items-center justify-between gap-5 border-b border-[#8FB6C9]/[0.06] pb-3">
              <div className="flex items-center gap-3">
                <img src="/logofav.png" alt="" className="h-7 w-7 object-contain opacity-60" />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#8FB6C9]/50">
                    Bx · GEORGE operational guide
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/38">
                    Give direction. Add pressure. Let GEORGE narrow the move.
                  </div>
                </div>
              </div>

              <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/26">
                Direction → Context → Move
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-left">
              {[
                ['1. State the direction', 'What are you trying to build, decide, fix, finish, become, or prepare for?'],
                ['2. Add useful pressure', 'Share timing, constraints, documents, people involved, risk, leverage, or what cannot be missed.'],
                ['3. Let GEORGE narrow', 'GEORGE can draft, sequence, prepare, reframe, review, or move you to the next useful step.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-[1rem] border border-white/[0.04] bg-black/20 px-4 py-3">
                  <div className="text-[12px] font-medium text-[#D7DBE4]/62">{title}</div>
                  <p className="mt-1.5 text-[11px] leading-5 text-[#D7DBE4]/34">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-6 gap-2">
              {useCases.map(([title, body]) => (
                <div key={title} className="rounded-[0.8rem] border border-[#8FB6C9]/[0.045] bg-[#8FB6C9]/[0.025] px-3 py-2 text-center">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#8FB6C9]/48">{title}</div>
                  <div className="mt-1 text-[10px] leading-4 text-[#D7DBE4]/28">{body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[142px] bottom-[180px] z-[18] hidden items-center justify-center md:flex">
      <div className="relative w-full max-w-[980px] px-10 opacity-80 transition-opacity duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.08),transparent_58%)]" />

        <div className="relative text-center">
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
