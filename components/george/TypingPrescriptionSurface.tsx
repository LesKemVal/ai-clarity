export default function TypingPrescriptionSurface() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[126px] bottom-[164px] z-[95] flex items-center justify-center px-7 md:hidden">
      <div className="relative w-full max-w-[380px] text-center">
        <img
          src="/logofav.png"
          alt=""
          className="mx-auto h-[132px] w-auto object-contain opacity-[0.09]"
        />

        <div className="mt-8 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#8FB6C9]/42">
          Bx — Prescription
        </div>

        <div className="mx-auto mt-4 h-px w-[62%] bg-gradient-to-r from-transparent via-[#8FB6C9]/18 to-transparent" />

        <div className="mx-auto mt-6 max-w-[310px] text-[18px] font-[300] leading-[1.55] tracking-[0.015em] text-[#D7DBE4]/42">
          GEORGE works toward your objective, then chooses the tools needed to move it forward.
        </div>

        <div className="mx-auto mt-7 max-w-[330px] text-[12px] leading-6 text-[#D7DBE4]/28">
          ask · share · help · LIVE · continuity · response shaping
        </div>
      </div>
    </div>
  )
}
