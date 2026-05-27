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
      <div className="pointer-events-none fixed inset-x-0 top-[102px] bottom-[206px] z-[18] hidden items-center justify-center md:flex">
        <div className="relative w-full max-w-[1220px] px-10 opacity-[0.985] transition-opacity duration-500">

          <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.08),transparent_68%)]" />

            <div className="absolute -left-[30%] top-0 h-full w-[42%] animate-[desktopShimmer_9s_linear_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent blur-[26px]" />
          </div>

          <div className="relative overflow-hidden rounded-[1.45rem] border border-[#8FB6C9]/[0.08] bg-[linear-gradient(180deg,rgba(5,8,14,0.88),rgba(5,8,14,0.72))] shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-[18px]">

            <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_49.6%,rgba(143,182,201,0.08)_50%,transparent_50.4%)]" />

            <div className="grid grid-cols-2">

              <div className="relative min-h-[520px] border-r border-white/[0.05] px-10 py-8">
                <div className="mb-8 flex items-center gap-3">
                  <img
                    src="/logofav.png"
                    alt=""
                    className="h-8 w-8 object-contain opacity-80"
                  />

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.28em] text-[#8FB6C9]/68">
                      NORMAL GEORGE
                    </div>

                    <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/52">
                      Direction → tools → execution
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {[
                    ['CONTACT', 'draft email · prepare message · send after review'],
                    ['CREATE', 'pitch deck · briefing · proposal · roadmap'],
                    ['BUILD', 'code · systems · workflows · launch steps'],
                    ['MOVE', 'plan · sequence · next step · reduce friction'],
                  ].map(([title, body]) => (
                    <div
                      key={title}
                      className="overflow-hidden rounded-[1rem] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(10,16,24,0.74),rgba(8,12,18,0.58))] px-5 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
                    >
                      <div className="text-[10px] uppercase tracking-[0.22em] text-[#8FB6C9]/62">
                        {title}
                      </div>

                      <div className="mt-2 text-[14px] leading-8 text-[#D7DBE4]/42">
                        {body}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[520px] px-10 py-8">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.28em] text-[#8FB6C9]/68">
                      LIVE GEORGE
                    </div>

                    <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/52">
                      Real-time operational support
                    </div>
                  </div>

                  <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/34">
                    timing · pressure · response
                  </div>
                </div>

                <div className="grid gap-4">
                  {[
                    ['PREPARE', 'interviews · negotiations · objections · recall'],
                    ['OPERATE', 'one earbud · next move · tactical response'],
                    ['ADAPT', 'timing · pacing · pressure · room awareness'],
                    ['CONTINUE', 'memory · continuity · operational recall'],
                  ].map(([title, body]) => (
                    <div
                      key={title}
                      className="overflow-hidden rounded-[1rem] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(10,16,24,0.74),rgba(8,12,18,0.58))] px-5 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
                    >
                      <div className="text-[10px] uppercase tracking-[0.22em] text-[#8FB6C9]/62">
                        {title}
                      </div>

                      <div className="mt-2 text-[14px] leading-8 text-[#D7DBE4]/42">
                        {body}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[102px] bottom-[212px] z-[18] flex items-center justify-center md:hidden">
      <div className="relative w-full px-7">

        <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.09),transparent_70%)]" />

          <div className="absolute -left-[45%] top-0 h-full w-[55%] animate-[desktopShimmer_10s_linear_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent blur-[28px]" />
        </div>

        <div className="relative overflow-hidden rounded-[1.5rem] border border-[#8FB6C9]/[0.08] bg-[linear-gradient(180deg,rgba(5,8,14,0.90),rgba(5,8,14,0.74))] px-6 py-8 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-[18px]">

          <div className="flex items-center justify-center">
            <img
              src="/logofav.png"
              alt=""
              className="h-16 w-16 object-contain opacity-24"
            />
          </div>

          <div className="mt-6 text-center text-[11px] uppercase tracking-[0.30em] text-[#8FB6C9]/62">
            NORMAL GEORGE
          </div>

          <div className="mt-3 text-center text-[15px] leading-8 text-[#D7DBE4]/40">
            Set the objective.
            <br />
            Attach context.
            <br />
            Execute deliberately.
          </div>

          <div className="mt-8 space-y-4">
            {[
              ['CONTACT', 'emails · replies · outreach'],
              ['CREATE', 'decks · proposals · briefings'],
              ['BUILD', 'code · systems · launch paths'],
              ['MOVE', 'next step · sequence · clarity'],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-[1rem] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(10,16,24,0.72),rgba(8,12,18,0.56))] px-4 py-3"
              >
                <div className="text-[10px] uppercase tracking-[0.22em] text-[#8FB6C9]/62">
                  {title}
                </div>

                <div className="mt-1 text-[13px] leading-7 text-[#D7DBE4]/40">
                  {body}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
