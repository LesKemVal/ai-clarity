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
      <div className="pointer-events-none fixed inset-x-0 top-[150px] bottom-[190px] z-[18] hidden items-center justify-center md:flex">
        <div className="relative w-full max-w-[1040px] px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.055),transparent_60%)]" />

          <div className="relative mx-auto grid max-w-[940px] grid-cols-3 gap-8 text-left">
            <section>
              <div className="mb-5 text-[10px] uppercase tracking-[0.28em] text-[#8FB6C9]/42">
                How to use GEORGE
              </div>

              <div className="space-y-5 text-[#D7DBE4]/38">
                <div>
                  <div className="text-[14px] text-[#D7DBE4]/58">1. State the direction</div>
                  <p className="mt-1 text-[12px] leading-5">Tell GEORGE what you are trying to become, build, fix, decide, or finish.</p>
                </div>

                <div>
                  <div className="text-[14px] text-[#D7DBE4]/58">2. Add the context</div>
                  <p className="mt-1 text-[12px] leading-5">Share constraints, documents, pressure, people, timing, and what cannot be missed.</p>
                </div>

                <div>
                  <div className="text-[14px] text-[#D7DBE4]/58">3. Move from there</div>
                  <p className="mt-1 text-[12px] leading-5">GEORGE narrows the path, prepares the next move, and keeps useful continuity.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-5 text-[10px] uppercase tracking-[0.28em] text-[#8FB6C9]/42">
                Use GEORGE for
              </div>

              <div className="space-y-4 text-[13px] text-[#D7DBE4]/44">
                <div>Strategy, direction, and execution plans</div>
                <div>Emails, outreach, pitches, and proposals</div>
                <div>Negotiation posture and response shaping</div>
                <div>Interview preparation and proof recall</div>
                <div>Documents, decisions, and next-step clarity</div>
              </div>
            </section>

            <section>
              <div className="mb-5 text-[10px] uppercase tracking-[0.28em] text-[#8FB6C9]/42">
                Runtime support
              </div>

              <div className="space-y-4 rounded-[1.1rem] border border-[#8FB6C9]/[0.07] bg-[#8FB6C9]/[0.025] p-5 text-[13px] leading-6 text-[#D7DBE4]/42">
                <div>Continuity without clutter.</div>
                <div>Structure without pressure.</div>
                <div>Guidance without taking control.</div>

                <div className="flex items-center gap-2 pt-2 text-[#D7DBE4]/50">
                  <img src="/newearbudicon.png" alt="" className="h-[15px] w-[15px] object-contain opacity-60" />
                  LIVE is available when words, timing, or pressure matter.
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[142px] bottom-[180px] z-[18] hidden items-center justify-center md:flex">
      <div className="relative w-full max-w-[980px] px-10">
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
