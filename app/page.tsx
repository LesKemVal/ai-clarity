import Link from 'next/link'

export default function RootPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#06070A] px-5 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#06070A_0%,#090B10_48%,#06070A_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[430px] overflow-hidden">
        <div className="mx-auto h-full w-full max-w-[980px] px-2">
          <div className="relative -ml-2 h-[224px] w-[calc(100%+16px)] overflow-hidden rounded-[1.45rem] bg-[linear-gradient(105deg,rgba(10,18,31,0.30),rgba(29,75,102,0.20)_44%,rgba(7,10,17,0.22))] opacity-80">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_42%,rgba(174,182,255,0.065),transparent_19%),radial-gradient(circle_at_74%_38%,rgba(126,201,218,0.06),transparent_18%)]" />
            <div className="absolute left-[6%] top-[58px] h-px w-[84%] bg-gradient-to-r from-transparent via-[#9BB8CF]/16 to-transparent" />
            <div className="absolute left-[12%] top-[98px] h-px w-[72%] bg-gradient-to-r from-transparent via-[#AEB6FF]/11 to-transparent" />
            <div className="absolute left-[24%] top-[136px] h-px w-[56%] bg-gradient-to-r from-transparent via-[#7EC9DA]/10 to-transparent" />
            <div className="absolute left-[18%] top-[74px] h-2 w-2 rounded-[0.25rem] bg-[#AEB6FF]/10" />
            <div className="absolute left-[42%] top-[90px] h-2.5 w-2.5 rounded-[0.3rem] bg-[#8FB6C9]/10" />
            <div className="absolute left-[63%] top-[64px] h-3 w-3 rounded-[0.35rem] bg-[#7EC9DA]/8" />
            <div className="absolute left-[80%] top-[116px] h-2 w-2 rounded-[0.25rem] bg-[#AEB6FF]/8" />
            <div className="absolute right-[5%] top-[32px] h-24 w-24 rounded-full border border-[#8FB6C9]/7" />
            <div className="absolute right-[9%] top-[56px] h-16 w-16 rounded-full border border-[#AEB6FF]/6" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-b from-transparent via-[#06070A]/80 to-[#06070A]" />
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

        <div className="mt-8 grid w-full max-w-[560px] gap-4 rounded-[1.35rem] border border-white/[0.055] bg-white/[0.018] p-4 text-left">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 text-[11px] tracking-[0.18em] text-white/38">
            <span>GEORGE TYPES</span>
            <span className="text-[#AEB6FF]/72">READY</span>
          </div>

          <div className="grid gap-4 text-[13px] leading-6 text-white/58">
            <div className="rounded-[0.9rem] bg-black/18 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/34">GEORGE</p>
              <p className="mt-2 text-white/60">Helps you think, decide, build, prepare, and move.</p>
            </div>

            <div className="overflow-hidden rounded-[1.2rem] bg-[linear-gradient(115deg,rgba(12,23,39,0.88),rgba(22,55,76,0.42),rgba(6,7,10,0.88))] p-4">
              <div className="relative min-h-[176px] overflow-hidden rounded-[1rem] bg-black/22 px-6 py-5">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,13,18,0.82),rgba(11,13,18,0.22),rgba(11,13,18,0.78))]" />
                <div className="relative z-10 max-w-[320px]">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#AEB6FF]/70">LIVE MODE</p>
                  <p className="mt-5 max-w-[300px] text-[22px] font-semibold leading-[1.25] tracking-[-0.04em] text-white/92">
                    Timing. Pressure. The next useful line.
                  </p>
                </div>
                <img
                  src="/earbud400.png"
                  alt="GEORGE LIVE"
                  className="absolute right-[-26px] top-[-20px] h-[218px] w-auto rotate-[8deg] object-contain opacity-[0.9]"
                />
                <img
                  src="/earbud400.png"
                  alt=""
                  className="absolute right-[190px] top-[-72px] h-[118px] w-auto -rotate-[16deg] object-contain opacity-[0.52]"
                />
              </div>
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
            className="flex items-center justify-center rounded-[1.15rem] border border-[#AEB6FF]/18 bg-[#AEB6FF]/[0.055] px-6 py-4 text-[15px] font-semibold text-[#D7DDFF] transition hover:border-[#AEB6FF]/28 hover:bg-[#AEB6FF]/[0.09] hover:text-white"
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
