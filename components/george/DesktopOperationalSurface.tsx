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
      <div className="pointer-events-none fixed inset-x-0 top-[102px] bottom-[206px] z-[18] hidden items-center justify-center md:flex">
        <div className="relative w-full max-w-[1080px] px-10 opacity-[0.985] transition-opacity duration-500">
          <div className="absolute inset-x-8 inset-y-0 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.072),transparent_68%)]" />

          <div className="relative mx-auto rounded-[1.35rem] border border-[#8FB6C9]/[0.09] bg-[linear-gradient(180deg,rgba(8,14,22,0.82),rgba(6,10,16,0.72))] px-7 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[18px]">
            <div className="mb-5 flex items-center justify-between gap-5 border-b border-[#8FB6C9]/[0.075] pb-4">
              <div className="flex items-center gap-3">
                <img src="/logofav.png" alt="" className="h-8 w-8 object-contain opacity-82" />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#8FB6C9]/68">
                    Bx · How to use GEORGE
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/56">
                    Set the direction. GEORGE maps the tactical route.
                  </div>
                </div>
              </div>

              <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/42">
                Direction → Context → Move
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {lanes.map(([title, body]) => (
                <div key={title} className="min-h-[112px] rounded-[1rem] border border-white/[0.055] bg-black/24 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.20em] text-[#8FB6C9]/64">{title}</div>
                  <p className="mt-2 text-[11px] leading-5 text-[#D7DBE4]/48">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-5 border-t border-[#8FB6C9]/[0.06] pt-4 text-[10px] uppercase tracking-[0.22em] text-[#8FB6C9]/46">
              <span>trajectory awareness</span>
              <span>response shaping</span>
              <span>document context</span>
              <span>continuity memory</span>
              <span className="inline-flex items-center gap-1.5">
                <img src="/newearbudicon.png" alt="" className="h-[13px] w-[13px] object-contain opacity-72" />
                live pressure
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[112px] bottom-[250px] z-[18] hidden items-center justify-center md:flex">
      <div className="relative w-full max-w-[980px] px-10 opacity-92 transition-opacity duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.088),transparent_58%)]" />

        <div className="relative mx-auto max-w-[980px] rounded-[1.35rem] border border-[#8FB6C9]/[0.08] bg-[linear-gradient(180deg,rgba(8,14,22,0.76),rgba(6,10,16,0.58))] px-10 py-12 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-[18px] text-center">
          <div className="text-[92px] font-[260] tracking-[0.22em] text-[#D7DBE4]/[0.11]">
            GEORGE
          </div>

          <div className="mt-6 text-[15px] font-light tracking-[0.04em] text-[#D7DBE4]/46">
            Set the direction. GEORGE maps the tactical route.
          </div>

          <div className="mx-auto mt-9 max-w-[820px] text-[16px] font-[300] leading-[1.7] tracking-[0.01em] text-[#D7DBE4]/34">
            Build carefully. Move deliberately. Let pressure reveal structure.
          </div>

          <div className="mx-auto mt-10 flex max-w-[860px] flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[10px] uppercase tracking-[0.24em] text-[#8FB6C9]/48">
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
