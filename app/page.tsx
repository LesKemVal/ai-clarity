import Link from 'next/link'

export default function RootPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#06070A] px-5 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,140,255,0.075),transparent_34%),linear-gradient(180deg,#06070A_0%,#090B10_48%,#06070A_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

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

        <div className="mt-8 grid w-full max-w-[520px] gap-3 rounded-[1.35rem] border border-white/[0.055] bg-white/[0.018] p-4 text-left">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 text-[11px] tracking-[0.18em] text-white/38">
            <span>MODES</span>
            <span className="text-[#AEB6FF]/72">READY</span>
          </div>

          <div className="grid gap-3 text-[13px] leading-6 text-white/58">
            <p>
              <span className="text-white/80">Normal GEORGE</span> helps you think, decide, build, prepare, and move.
            </p>
            <p>
              <span className="text-white/80">GEORGE LIVE</span> helps with timing, pressure, wording, and the next useful line while the moment is happening.
            </p>
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
            className="flex items-center justify-center rounded-[1.15rem] border border-[#7C8CFF]/16 bg-[#7C8CFF]/[0.055] px-6 py-4 text-[15px] font-semibold text-[#D7DDFF] transition hover:border-[#7C8CFF]/28 hover:bg-[#7C8CFF]/[0.09] hover:text-white"
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
