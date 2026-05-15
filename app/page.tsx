import Link from 'next/link'

export default function RootPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#06070A] px-5 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#06070A_0%,#090B10_44%,#06070A_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.045]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(180deg,rgba(8,23,39,0.34),rgba(11,24,38,0.17)_38%,rgba(6,7,10,0.62)_72%,rgba(6,7,10,0.92)_100%)]" />
        <div className="absolute left-1/2 top-[-74px] h-[520px] w-[1180px] -translate-x-1/2 overflow-hidden rounded-[1.8rem] bg-[linear-gradient(105deg,rgba(10,18,31,0.34),rgba(29,75,102,0.22)_44%,rgba(7,10,17,0.24))] opacity-72">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(174,182,255,0.075),transparent_24%),radial-gradient(circle_at_74%_32%,rgba(126,201,218,0.06),transparent_18%)]" />
          <div className="absolute left-[6%] top-[148px] h-px w-[84%] bg-gradient-to-r from-transparent via-[#9BB8CF]/13 to-transparent" />
          <div className="absolute left-[12%] top-[212px] h-px w-[72%] bg-gradient-to-r from-transparent via-[#AEB6FF]/9 to-transparent" />
          <div className="absolute left-[24%] top-[282px] h-px w-[56%] bg-gradient-to-r from-transparent via-[#7EC9DA]/8 to-transparent" />
          <div className="absolute left-[18%] top-[168px] h-2 w-2 rounded-[0.25rem] bg-[#AEB6FF]/8" />
          <div className="absolute left-[42%] top-[208px] h-2.5 w-2.5 rounded-[0.3rem] bg-[#8FB6C9]/8" />
          <div className="absolute left-[63%] top-[164px] h-3 w-3 rounded-[0.35rem] bg-[#7EC9DA]/6" />
          <div className="absolute right-[5%] top-[112px] h-24 w-24 rounded-full border border-[#8FB6C9]/5" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-b from-transparent via-[#06070A]/62 to-[#06070A]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[720px] flex-col items-center px-6 text-center">
        <img
          src="/bxnew20.png"
          alt="BRANESx"
          className="mb-7 h-7 w-auto object-contain opacity-78"
        />

        <div className="mb-3 text-[10px] font-medium tracking-[0.28em] text-white/34">
          INTELLIGENT UTILITY
        </div>

        <h1 className="text-[34px] font-semibold tracking-[-0.055em] text-white md:text-[56px]">
          GEORGE
        </h1>

        <p className="mt-5 max-w-[620px] text-[15px] leading-7 text-white/62 md:text-[17px]">
          Operational intelligence for real conversations, decisions, and execution.
        </p>

        <div className="mt-8 grid w-full max-w-[560px] gap-4 rounded-[1.35rem] border border-white/[0.032] bg-white/[0.012] p-4 text-left">
          <div className="flex items-center justify-between border-b border-white/[0.032] pb-3 text-[11px] tracking-[0.18em] text-white/34">
            <span>GEORGE TYPES</span>
            <span className="text-[#AEB6FF]/66">READY</span>
          </div>

          <div className="grid gap-4 text-[13px] leading-6 text-white/58">
            <div className="rounded-[0.9rem] bg-black/14 p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/32">GEORGE</p>
              <p className="mt-3 text-[16px] leading-7 text-white/58">Helps you think, decide, build, prepare, and move.</p>
            </div>

            <div className="rounded-[0.9rem] bg-black/14 p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#AEB6FF]/58">GEORGE LIVE</p>
              <p className="mt-3 text-[16px] leading-7 text-white/58">Helps with timing, pressure, wording, and the next useful line while the moment is happening.</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid w-full max-w-[420px] gap-3">
          <Link
            href="/george"
            className="flex items-center justify-center rounded-[1.15rem] bg-white px-6 py-4 text-[15px] font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
          >
            Enter GEORGE
          </Link>

          <Link
            href="/george/live-entry"
            className="flex items-center justify-center rounded-[1.15rem] border border-[#AEB6FF]/14 bg-[#AEB6FF]/[0.04] px-6 py-4 text-[15px] font-semibold text-[#D7DDFF] transition hover:border-[#AEB6FF]/22 hover:bg-[#AEB6FF]/[0.065] hover:text-white"
          >
            Enter GEORGE LIVE
          </Link>
        </div>

        <p className="mt-5 text-[12px] leading-5 text-white/32">
          Smart starts free. LIVE access begins with Brilliant.
        </p>
      </div>
    </main>
  )
}
