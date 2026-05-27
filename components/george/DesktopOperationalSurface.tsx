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
              Set the direction. GEORGE maps the tactical route.
            </div>

            <div className="mx-auto mt-9 max-w-[820px] text-[17px] font-[300] leading-[1.75] tracking-[0.02em] text-[#D7DBE4]/26">
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

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[92px] bottom-[198px] z-[18] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(75,105,180,0.08),transparent_68%)]" />
      <div className="absolute -left-[35%] top-0 h-full w-[40%] animate-[desktopShimmer_10s_linear_infinite] bg-gradient-to-r from-transparent via-white/[0.045] to-transparent blur-[28px]" />

      <div className="relative h-full md:hidden">
        <div className="absolute inset-x-6 top-8 bottom-0 overflow-hidden rounded-[1.6rem] border border-white/[0.045] bg-[linear-gradient(180deg,rgba(3,5,9,0.90),rgba(2,4,8,0.78))] shadow-[0_24px_90px_rgba(0,0,0,0.44)] backdrop-blur-[24px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(90,120,210,0.08),transparent_72%)]" />

          <div className="relative flex h-full flex-col px-7 pt-9 text-left">
            <div className="text-[10px] uppercase tracking-[0.30em] text-[#8FB6C9]/66">
              NORMAL GEORGE
            </div>

            <div className="mt-4 text-[15px] leading-8 text-[#D7DBE4]/46">
              Set the objective. Attach context. Execute deliberately.
            </div>

            <div className="mt-8 space-y-4">
              {[
                ['CONTACT', 'emails · replies · outreach'],
                ['CREATE', 'briefings · proposals · operational planning · framing · strategic preparation'],
                ['BUILD', 'systems · runtime flows · launch sequencing · architecture thinking · deployment planning'],
                ['MOVE', 'pressure handling · sequencing · execution clarity · tactical movement · decision flow'],
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

      <div className="relative hidden h-full items-center justify-center px-10 md:flex">
        <div className="relative h-[560px] w-full max-w-[1240px] overflow-hidden rounded-[1.7rem] border border-[#8FB6C9]/[0.08] bg-[linear-gradient(180deg,rgba(5,8,14,0.90),rgba(5,8,14,0.76))] shadow-[0_28px_110px_rgba(0,0,0,0.46)] backdrop-blur-[20px]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_49.8%,rgba(143,182,201,0.06)_50%,transparent_50.2%)]" />

          <div className="grid h-full grid-cols-2">
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

                  <div className="mt-1 text-[12px] text-[#D7DBE4]/36">
                    Direction → tools → execution
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {[
                  ['CONTACT', 'drafting · outreach · response shaping · negotiation wording · follow-up sequencing'],
                  ['CREATE', 'runtime planning · proposals · strategic framing · briefing structure · operational positioning'],
                  ['BUILD', 'systems · workflows · operational architecture · launch planning · execution mapping'],
                  ['MOVE', 'execution sequencing · pressure navigation · tactical clarity · decision pacing'],
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

            <div className="relative px-12 py-10">
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.30em] text-[#8FB6C9]/66">
                    LIVE GEORGE
                  </div>

                  <div className="mt-1 text-[12px] text-[#D7DBE4]/36">
                    Real-time operational support
                  </div>
                </div>

                <div className="text-[10px] uppercase tracking-[0.22em] text-[#D7DBE4]/28">
                  timing · pressure · response
                </div>
              </div>

              <div className="space-y-5">
                {[
                  ['PREPARE', 'interviews · negotiations · objection pressure · executive conversations · high-stakes preparation'],
                  ['OPERATE', 'LIVE runtime · earbuds · tactical response · real-time conversational guidance · room adaptation'],
                  ['ADAPT', 'timing · cadence · room pressure awareness · interruption handling · conversational posture'],
                  ['CONTINUE', 'memory · continuity · recall · operational persistence · context restoration'],
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
