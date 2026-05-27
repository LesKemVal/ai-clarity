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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[96px] bottom-[198px] z-[18] overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(75,105,180,0.05),transparent_72%)]" />

      <div className="absolute -left-[35%] top-0 h-full w-[40%] animate-[desktopShimmer_10s_linear_infinite] bg-gradient-to-r from-transparent via-white/[0.035] to-transparent blur-[28px]" />

      {/* MOBILE */}
      <div className="relative h-full overflow-y-auto px-6 py-8 md:hidden">
        <div className="mb-7">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#8FB6C9]/62">
            GEORGE RESOURCES
          </div>

          <div className="mt-3 max-w-[320px] text-[13px] leading-7 text-[#D7DBE4]/34">
            GEORGE uses layered operational resources to help structure decisions, communication, execution, sequencing, and runtime adaptation.
          </div>
        </div>

        <div className="space-y-6">
          {[
            [
              'COMMUNICATION',
              'email drafting · response shaping · negotiation wording · conversational positioning · outreach sequencing'
            ],
            [
              'RUNTIME THINKING',
              'multi-step reasoning · execution sequencing · pressure handling · tactical framing · operational clarity'
            ],
            [
              'LIVE SUPPORT',
              'real-time conversational assistance · timing awareness · pacing adjustment · adaptive response support'
            ],
            [
              'BUILD SYSTEMS',
              'workflow structure · architecture thinking · launch planning · operational mapping · deployment organization'
            ],
            [
              'MEMORY + CONTINUITY',
              'context restoration · continuity awareness · persistent operational recall · saved direction'
            ],
          ].map(([title, body]) => (
            <div key={title}>
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#8FB6C9]/58">
                {title}
              </div>

              <div className="mt-2 text-[13px] leading-7 text-[#D7DBE4]/32">
                {body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP */}
      <div className="relative hidden h-full overflow-hidden md:block">
        <div className="grid h-full grid-cols-2 gap-x-16 px-16 py-12">
          <div>
            <div className="text-[10px] uppercase tracking-[0.30em] text-[#8FB6C9]/64">
              NORMAL GEORGE
            </div>

            <div className="mt-4 max-w-[520px] text-[15px] leading-8 text-[#D7DBE4]/34">
              GEORGE combines reasoning systems, continuity memory, drafting assistance, runtime organization, communication shaping, and execution sequencing into one operational layer.
            </div>

            <div className="mt-12 space-y-8">
              {[
                [
                  'COMMUNICATION',
                  'emails · response shaping · negotiation language · outreach structure · conversational clarity'
                ],
                [
                  'REASONING',
                  'multi-step thinking · tactical framing · sequencing · pressure analysis · decision support'
                ],
                [
                  'EXECUTION',
                  'planning · operational movement · workflow structure · launch organization · tactical next-steps'
                ],
                [
                  'BUILD',
                  'systems thinking · architecture mapping · runtime planning · deployment sequencing'
                ],
              ].map(([title, body]) => (
                <div key={title}>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[#8FB6C9]/58">
                    {title}
                  </div>

                  <div className="mt-2 max-w-[520px] text-[14px] leading-8 text-[#D7DBE4]/30">
                    {body}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.30em] text-[#8FB6C9]/64">
              LIVE GEORGE
            </div>

            <div className="mt-4 max-w-[520px] text-[15px] leading-8 text-[#D7DBE4]/34">
              LIVE GEORGE uses adaptive runtime resources to support users during active conversations, pressure environments, negotiations, interviews, and operational moments.
            </div>

            <div className="mt-12 space-y-8">
              {[
                [
                  'RUNTIME AWARENESS',
                  'timing · cadence · interruption awareness · pacing adaptation · conversational pressure detection'
                ],
                [
                  'TACTICAL SUPPORT',
                  'response guidance · conversational positioning · objection handling · live adaptation'
                ],
                [
                  'CONTINUITY',
                  'context persistence · runtime recall · conversation continuity · remembered operational direction'
                ],
                [
                  'LIVE OPERATION',
                  'earbud assistance · room awareness · pressure navigation · tactical conversational movement'
                ],
              ].map(([title, body]) => (
                <div key={title}>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[#8FB6C9]/58">
                    {title}
                  </div>

                  <div className="mt-2 max-w-[520px] text-[14px] leading-8 text-[#D7DBE4]/30">
                    {body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
