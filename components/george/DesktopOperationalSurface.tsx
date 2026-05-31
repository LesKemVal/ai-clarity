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
      <div className="pointer-events-none fixed inset-x-0 top-[112px] bottom-[250px] z-[18] hidden items-center justify-center lg:flex">
        <div className="relative h-full w-full overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.055),transparent_38%),radial-gradient(circle_at_78%_62%,rgba(124,140,255,0.045),transparent_45%)]" />

          <div className="absolute left-[-6%] top-[18%] animate-[georgeGhostDrift_34s_ease-in-out_infinite] select-none text-[210px] font-semibold uppercase leading-none tracking-[-0.13em] text-white/[0.032]">
            NEXT
          </div>

          <div className="absolute right-[-8%] top-[48%] animate-[georgeGhostDriftSlow_44s_ease-in-out_infinite] select-none text-[165px] font-semibold uppercase leading-none tracking-[-0.11em] text-white/[0.024]">
            MOVE
          </div>

          <div className="relative flex h-full items-center justify-center px-10 text-center">
            <div className="-translate-y-8">
              <div className="text-[12px] uppercase tracking-[0.34em] text-[#F4F7FF]/38">
                GEORGE
              </div>

              <div className="mx-auto mt-8 max-w-[620px] text-[46px] font-light leading-[1.08] tracking-[-0.07em] text-[#F7F8FF]/82">
                Bring the situation.
                <br />
                Find the next useful move.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[96px] bottom-[198px] z-[18] hidden overflow-hidden bg-[#05070A] lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(95,125,190,0.04),transparent_70%)]" />
      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <div className="w-full max-w-[560px] -translate-y-6">
          <div className="text-[11px] uppercase tracking-[0.26em] text-[#F4F7FF]/42">
            GEORGE
          </div>

          <div className="mx-auto mt-5 max-w-[480px] text-[20px] font-light leading-8 tracking-[-0.03em] text-[#F4F7FF]/72">
            Bring the situation.
            <br />
            Find the next useful move.
          </div>
        </div>
      </div>
    </div>
  )
}
