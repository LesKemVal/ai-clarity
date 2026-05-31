export default function TypingPrescriptionSurface() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[152px] z-[34] mx-auto w-full max-w-[430px] px-7 lg:hidden">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[0.30em] text-[#D7DBE4]/30">
          GEORGE
        </div>

        <div className="mt-5 text-[22px] font-light leading-8 tracking-[-0.04em] text-[#D7DBE4]/72">
          What are you trying to move?
        </div>

        <div className="mx-auto mt-7 grid max-w-[310px] grid-cols-2 gap-2 text-[11px] uppercase tracking-[0.20em] text-[#D7DBE4]/42">
          <div className="rounded-full border border-white/[0.055] px-3 py-2">Think</div>
          <div className="rounded-full border border-white/[0.055] px-3 py-2">Prepare</div>
          <div className="rounded-full border border-white/[0.055] px-3 py-2">Respond</div>
          <div className="rounded-full border border-white/[0.055] px-3 py-2">Decide</div>
        </div>

        <div className="mx-auto mt-7 max-w-[300px] text-[13px] leading-6 text-[#D7DBE4]/42">
          Describe the situation below. GEORGE will separate signal from noise.
        </div>
      </div>
    </div>
  )
}
