export default function DesktopOperationalSurface({
  visible,
  mode = 'idle',
}: {
  visible: boolean
  mode?: 'idle' | 'active'
}) {
  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[92px] bottom-[198px] z-[14] overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(75,105,180,0.08),transparent_68%)]" />

      <div className="absolute -left-[35%] top-0 h-full w-[40%] animate-[desktopShimmer_10s_linear_infinite] bg-gradient-to-r from-transparent via-white/[0.045] to-transparent blur-[28px]" />

      {/* MOBILE */}
      <div className="relative h-full md:hidden">

        <div className="absolute inset-x-6 top-8 bottom-0 overflow-hidden rounded-[1.6rem] border border-[#8FB6C9]/[0.07] bg-[linear-gradient(180deg,rgba(5,8,14,0.92),rgba(5,8,14,0.78))] shadow-[0_24px_90px_rgba(0,0,0,0.44)] backdrop-blur-[20px]">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(90,120,210,0.08),transparent_72%)]" />

          <div className="relative flex h-full flex-col items-center px-8 pt-14 text-center">

            <img
              src="/logofav.png"
              alt=""
              className="h-20 w-20 object-contain opacity-[0.18]"
            />

            <div className="mt-8 text-[11px] uppercase tracking-[0.34em] text-[#8FB6C9]/66">
              NORMAL GEORGE
            </div>

            <div className="mt-7 space-y-6 text-[15px] leading-8 text-[#D7DBE4]/48">
              <div>Set the objective.</div>
              <div>Attach context.</div>
              <div>Execute deliberately.</div>
            </div>

            <div className="mt-14 w-full space-y-5">

              {[
                ['CONTACT', 'emails · replies · outreach'],
                ['CREATE', 'decks · proposals · briefings'],
                ['BUILD', 'code · systems · launch paths'],
                ['MOVE', 'next step · sequence · clarity'],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="overflow-hidden rounded-[1.15rem] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(10,16,24,0.74),rgba(8,12,18,0.58))] px-5 py-4 text-left"
                >
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[#8FB6C9]/64">
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

      {/* DESKTOP */}
      <div className="relative hidden h-full items-center justify-center px-10 md:flex">

        <div className="relative h-[560px] w-full max-w-[1240px] overflow-hidden rounded-[1.7rem] border border-[#8FB6C9]/[0.08] bg-[linear-gradient(180deg,rgba(5,8,14,0.90),rgba(5,8,14,0.76))] shadow-[0_28px_110px_rgba(0,0,0,0.46)] backdrop-blur-[20px]">

          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_49.8%,rgba(143,182,201,0.06)_50%,transparent_50.2%)]" />

          <div className="grid h-full grid-cols-2">

            {/* LEFT */}
            <div className="relative border-r border-white/[0.05] px-12 py-10">

              <div className="mb-10 flex items-center gap-4">
                <img
                  src="/logofav.png"
                  alt=""
                  className="h-10 w-10 object-contain opacity-70"
                />

                <div>
                  <div className="text-[10px] uppercase tracking-[0.30em] text-[#8FB6C9]/66">
                    NORMAL GEORGE
                  </div>

                  <div className="mt-1 text-[12px] text-[#D7DBE4]/44">
                    Direction → tools → execution
                  </div>
                </div>
              </div>

              <div className="space-y-5">

                {[
                  ['CONTACT', 'draft email · outreach · review'],
                  ['CREATE', 'pitch deck · proposal · briefing'],
                  ['BUILD', 'code · workflows · systems'],
                  ['MOVE', 'next step · execution · clarity'],
                ].map(([title, body]) => (
                  <div
                    key={title}
                    className="overflow-hidden rounded-[1.15rem] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(10,16,24,0.74),rgba(8,12,18,0.58))] px-5 py-4"
                  >
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[#8FB6C9]/64">
                      {title}
                    </div>

                    <div className="mt-2 text-[14px] leading-8 text-[#D7DBE4]/42">
                      {body}
                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* RIGHT */}
            <div className="relative px-12 py-10">

              <div className="mb-10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.30em] text-[#8FB6C9]/66">
                    LIVE GEORGE
                  </div>

                  <div className="mt-1 text-[12px] text-[#D7DBE4]/44">
                    Real-time operational support
                  </div>
                </div>

                <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/28">
                  timing · pressure · response
                </div>
              </div>

              <div className="space-y-5">

                {[
                  ['PREPARE', 'interviews · negotiations · objections'],
                  ['OPERATE', 'one earbud · tactical guidance'],
                  ['ADAPT', 'timing · pacing · room awareness'],
                  ['CONTINUE', 'memory · continuity · recall'],
                ].map(([title, body]) => (
                  <div
                    key={title}
                    className="overflow-hidden rounded-[1.15rem] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(10,16,24,0.74),rgba(8,12,18,0.58))] px-5 py-4"
                  >
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[#8FB6C9]/64">
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
