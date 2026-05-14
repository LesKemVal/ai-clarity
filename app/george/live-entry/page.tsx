import Link from 'next/link'

export default function GeorgeLiveEntryPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#06070A] px-5 py-8 text-white">
      <img
        src="/landing/city02.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.22]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,10,0.80)_0%,rgba(6,7,10,0.94)_56%,rgba(6,7,10,0.99)_100%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[760px] flex-col items-center px-6 text-center">
        <img
          src="/bxnew20.png"
          alt="BRANESx"
          className="mb-7 h-8 w-auto object-contain opacity-75"
        />

        <div className="mb-3 text-[10px] font-medium tracking-[0.26em] text-white/34">
          OPERATIONAL LIVE
        </div>

        <h1 className="text-[34px] font-semibold tracking-[-0.055em] text-white md:text-[58px]">
          GEORGE LIVE
        </h1>

        <p className="mt-5 max-w-[660px] text-[15px] leading-7 text-white/62 md:text-[17px]">
          Real-time conversation support for interviews, negotiations, meetings, appointments, sales, and difficult moments where words matter.
        </p>

        <div className="mt-8 grid w-full max-w-[520px] gap-3 rounded-[1.4rem] border border-white/[0.07] bg-black/30 p-4 text-left">
          <div className="flex items-center justify-between border-b border-white/[0.055] pb-3 text-[12px] tracking-[0.18em] text-white/42">
            <span>STATUS</span>
            <span className="text-[#AEB6FF]/80">READY</span>
          </div>

          <div className="grid gap-2 text-[13px] leading-6 text-white/62">
            <p>Use one earbud if you can.</p>
            <p>GEORGE watches timing, pressure, hesitation, risk, and the next useful line.</p>
          </div>
        </div>

        <Link
          href="/george/live"
          className="mt-7 flex w-full max-w-[420px] items-center justify-center rounded-[1.15rem] bg-white px-6 py-4 text-[15px] font-semibold text-[#0B0D12] transition hover:translate-y-[-1px] hover:bg-[#F3F5F7]"
        >
          Begin LIVE
        </Link>

        <Link
          href="/george"
          className="mt-5 text-[13px] text-white/34 transition hover:text-white/62"
        >
          Back to GEORGE
        </Link>
      </div>
    </main>
  )
}
