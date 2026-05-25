export default function TypingPrescriptionSurface() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[104px] bottom-[150px] z-[55] flex items-center justify-center overflow-hidden px-5 md:hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(124,140,255,0.07),transparent_42%)]" />

      <div className="relative h-full w-full max-w-[430px] opacity-[0.82]">
        <svg
          viewBox="0 0 390 520"
          className="absolute inset-0 h-full w-full"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M195 240 C122 206 86 168 52 110"
            stroke="rgba(124,140,255,0.32)"
            strokeWidth="1.3"
            strokeDasharray="4 9"
            filter="url(#softGlow)"
          />

          <path
            d="M202 244 C284 214 320 176 346 116"
            stroke="rgba(143,182,201,0.28)"
            strokeWidth="1.3"
            strokeDasharray="4 9"
            filter="url(#softGlow)"
          />

          <path
            d="M194 274 C118 314 82 356 54 430"
            stroke="rgba(124,140,255,0.24)"
            strokeWidth="1.2"
            strokeDasharray="4 9"
          />

          <path
            d="M204 278 C286 318 326 368 346 436"
            stroke="rgba(143,182,201,0.22)"
            strokeWidth="1.2"
            strokeDasharray="4 9"
          />

          <path
            d="M198 328 C198 376 198 414 198 470"
            stroke="rgba(124,140,255,0.24)"
            strokeWidth="1.2"
            strokeDasharray="4 9"
          />
        </svg>

        <div className="absolute inset-x-0 top-[18px] text-center text-[11px] uppercase tracking-[0.34em] text-[#AEB6FF]/36">
          iPhone 15 Pro Max mapping
        </div>

        <div className="absolute left-1/2 top-1/2 flex h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2.2rem] border border-[#8FB6C9]/[0.07] bg-black/[0.10] shadow-[0_0_80px_rgba(124,140,255,0.08)] backdrop-blur-[2px]">
          <img
            src="/newestlogo090.png"
            alt=""
            className="h-[118px] w-auto object-contain opacity-[0.16]"
          />
        </div>

        <div className="absolute left-[8px] top-[86px] max-w-[122px] text-left">
          <div className="text-[9px] uppercase tracking-[0.22em] text-[#AEB6FF]/46">
            Sidebar
          </div>

          <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/28">
            continuity
            <br />
            sessions
            <br />
            tools
          </div>
        </div>

        <div className="absolute right-[2px] top-[90px] max-w-[132px] text-right">
          <div className="text-[9px] uppercase tracking-[0.22em] text-[#8FB6C9]/44">
            LIVE
          </div>

          <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/28">
            real conversation
            <br />
            support
            <br />
            earbud · timing
          </div>
        </div>

        <div className="absolute left-[6px] bottom-[132px] max-w-[124px] text-left">
          <div className="text-[9px] uppercase tracking-[0.22em] text-[#AEB6FF]/42">
            Mic
          </div>

          <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/26">
            voice input
            <br />
            hands free
          </div>
        </div>

        <div className="absolute right-[0px] bottom-[138px] max-w-[128px] text-right">
          <div className="text-[9px] uppercase tracking-[0.22em] text-[#8FB6C9]/42">
            Send
          </div>

          <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/26">
            execute
            <br />
            shape
            <br />
            move forward
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-[94px] text-center">
          <div className="text-[9px] uppercase tracking-[0.22em] text-[#AEB6FF]/38">
            Input
          </div>

          <div className="mt-1 text-[12px] leading-5 text-[#D7DBE4]/24">
            ask · share · direct
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-[20px] text-center text-[10px] uppercase tracking-[0.32em] text-[#D7DBE4]/16">
          Direction → Action → Signal
        </div>
      </div>
    </div>
  )
}
