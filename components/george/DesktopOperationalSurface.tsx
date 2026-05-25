export default function DesktopOperationalSurface({
  visible,
}: {
  visible: boolean
}) {
  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[142px] bottom-[180px] z-[18] hidden items-center justify-center md:flex">
      <div className="relative w-full max-w-[980px] px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,140,210,0.08),transparent_58%)]" />

        <div className="relative text-center">
          <div className="text-[82px] font-[260] tracking-[0.34em] text-[#D7DBE4]/[0.06]">
            GEORGE
          </div>

          <div className="mt-4 text-[15px] font-light tracking-[0.12em] text-[#D7DBE4]/32">
            Direction sharpens when the room becomes real.
          </div>

          <div className="mx-auto mt-10 max-w-[820px] text-[18px] font-[300] leading-[1.9] tracking-[0.02em] text-[#D7DBE4]/20">
            Build carefully. Move deliberately. Negotiate without panic.
            Let pressure reveal structure instead of fear.
          </div>

          <div className="mx-auto mt-14 flex max-w-[920px] flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[11px] uppercase tracking-[0.24em] text-[#8FB6C9]/42">
            <span>trajectory awareness</span>
            <span>room pressure</span>
            <span>execution sequencing</span>

            <span className="flex items-center gap-2">
              <img
                src="/newearbudicon.png"
                alt=""
                className="h-[14px] w-[14px] object-contain opacity-55"
              />
              live support
            </span>

            <span>response shaping</span>
            <span>continuity memory</span>
            <span>negotiation posture</span>
            <span>document context</span>
            <span>operational recall</span>
          </div>
        </div>
      </div>
    </div>
  )
}
