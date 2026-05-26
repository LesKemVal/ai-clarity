export default function DesktopOperationalSurface({
  visible,
  mode = 'idle',
}: {
  visible: boolean
  mode?: 'idle' | 'active'
}) {
  if (!visible) return null

  if (mode === 'active') {
    const lanes = [
      ['Direction', 'Name the outcome, audience, pressure, and desired finish.'],
      ['Draft', 'Emails, outreach, replies, proposals, scripts, and asks.'],
      ['Build', 'Plans, decks, workflows, product paths, and launch steps.'],
      ['Prepare', 'Interviews, calls, rooms, objections, and proof recall.'],
      ['Review', 'Documents, offers, risk, leverage, and missing context.'],
      ['Execute', 'Sequence the work, reduce friction, and move the next step.'],
      ['LIVE', 'Use one earbud when timing, tone, or pressure matters.'],
      ['Chamber', 'Save confirmed goals so GEORGE can preserve the path.'],
    ]

    return (
      <div className="pointer-events-none fixed inset-x-0 top-[96px] bottom-[205px] z-[18] hidden items-center justify-center md:flex">
        <div className="relative w-full max-w-[1080px] px-10 opacity-82 transition-opacity duration-500">
          <div className="absolute inset-x-8 inset-y-0 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.052),transparent_68%)]" />

          <div className="relative mx-auto rounded-[1.35rem] border border-[#8FB6C9]/[0.065] bg-[#08111D]/[0.34] px-7 py-6 shadow-[0_20px_70px_rgba(0,0,0,0.30)] backdrop-blur-[12px]">
            <div className="mb-5 flex items-center justify-between gap-5 border-b border-[#8FB6C9]/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <img src="/logofav.png" alt="" className="h-8 w-8 object-contain opacity-68" />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#8FB6C9]/52">
                    Bx · How to use GEORGE
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/40">
                    Give direction. Add pressure. Let GEORGE narrow the move.
                  </div>
                </div>
              </div>

              <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/28">
                Direction → Context → Move
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {lanes.map(([title, body]) => (
                <div key={title} className="min-h-[112px] rounded-[1rem] border border-white/[0.045] bg-black/22 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.20em] text-[#8FB6C9]/52">{title}</div>
                  <p className="mt-2 text-[11px] leading-5 text-[#D7DBE4]/34">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-5 border-t border-[#8FB6C9]/[0.05] pt-4 text-[10px] uppercase tracking-[0.22em] text-[#8FB6C9]/34">
              <span>trajectory awareness</span>
              <span>response shaping</span>
              <span>document context</span>
              <span>continuity memory</span>
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
    <div className="pointer-events-none fixed inset-x-0 top-[130px] bottom-[230px] z-[18] hidden items-center justify-center md:flex">
      <div className="relative w-full max-w-[980px] px-10 opacity-74 transition-opacity duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.07),transparent_58%)]" />

        <div className="relative text-center">
          <div className="text-[82px] font-[260] tracking-[0.34em] text-[#D7DBE4]/[0.04]">
            GEORGE
          </div>

          <div className="mt-4 text-[15px] font-light tracking-[0.12em] text-[#D7DBE4]/24">
            Direction sharpens when the room becomes real.
          </div>

          <div className="mx-auto mt-9 max-w-[820px] text-[17px] font-[300] leading-[1.75] tracking-[0.02em] text-[#D7DBE4]/14">
            Build carefully. Move deliberately. Let pressure reveal structure instead of fear.
          </div>

          <div className="mx-auto mt-10 flex max-w-[860px] flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[10px] uppercase tracking-[0.24em] text-[#8FB6C9]/30">
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
