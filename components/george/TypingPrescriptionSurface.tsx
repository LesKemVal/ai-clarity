export default function TypingPrescriptionSurface() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[112px] bottom-[154px] z-[55] flex items-center justify-center overflow-hidden px-5 md:hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(143,182,201,0.055),transparent_42%)]" />

      <div className="relative h-full w-full max-w-[430px] opacity-80">
        <svg
          viewBox="0 0 390 520"
          className="absolute inset-0 h-full w-full"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M196 245 C120 210 80 168 48 112"
            stroke="rgba(143,182,201,0.24)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <path
            d="M202 250 C286 218 324 176 352 116"
            stroke="rgba(174,182,255,0.20)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <path
            d="M196 272 C114 310 76 358 48 430"
            stroke="rgba(143,182,201,0.20)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <path
            d="M202 274 C280 318 328 368 350 438"
            stroke="rgba(174,182,255,0.18)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />

          <path d="M52 112 l-10 -2 l7 8" stroke="rgba(143,182,201,0.30)" strokeWidth="1" />
          <path d="M348 116 l7 -8 l-10 2" stroke="rgba(174,182,255,0.26)" strokeWidth="1" />
          <path d="M50 428 l-9 4 l9 4" stroke="rgba(143,182,201,0.24)" strokeWidth="1" />
          <path d="M348 438 l8 5 l-3 -9" stroke="rgba(174,182,255,0.22)" strokeWidth="1" />
        </svg>

        <div className="absolute left-1/2 top-1/2 flex h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2rem] border border-[#8FB6C9]/[0.075] bg-black/[0.10] shadow-[0_0_70px_rgba(143,182,201,0.055)] backdrop-blur-[2px]">
          <img
            src="/logofav.png"
            alt=""
            className="h-[112px] w-[112px] object-contain opacity-[0.11]"
          />
        </div>

        <div className="absolute left-0 top-[74px] max-w-[128px] text-left">
          <div className="text-[9px] uppercase tracking-[0.22em] text-[#8FB6C9]/38">Sidebar</div>
          <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/28">continuity · sessions · tools</div>
        </div>

        <div className="absolute right-0 top-[82px] max-w-[138px] text-right">
          <div className="text-[9px] uppercase tracking-[0.22em] text-[#AEB6FF]/36">LIVE</div>
          <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/28">earbud · timing · pressure</div>
        </div>

        <div className="absolute left-0 bottom-[70px] max-w-[132px] text-left">
          <div className="text-[9px] uppercase tracking-[0.22em] text-[#8FB6C9]/34">Input</div>
          <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/26">ask · upload · direct</div>
        </div>

        <div className="absolute right-0 bottom-[62px] max-w-[140px] text-right">
          <div className="text-[9px] uppercase tracking-[0.22em] text-[#AEB6FF]/34">Send</div>
          <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/26">execute · shape · move</div>
        </div>

        <div className="absolute inset-x-0 bottom-[18px] text-center text-[10px] uppercase tracking-[0.28em] text-[#D7DBE4]/18">
          Direction → Action → Signal
        </div>
      </div>
    </div>
  )
}
