import Link from 'next/link'

export default function RootPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#080A12] px-5 py-6 text-white md:px-6 md:py-8">
      <img
        src="/landing/city02.png"
        alt=""
        className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-[0.46] blur-[1.5px]"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(124,140,255,0.20),transparent_38%),linear-gradient(180deg,rgba(8,10,18,0.58)_0%,rgba(8,10,18,0.80)_48%,rgba(8,10,18,0.96)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,10,18,0.94)_0%,rgba(8,10,18,0.66)_48%,rgba(8,10,18,0.94)_100%)]" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-260px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#7C8CFF]/18 blur-[140px]" />
        <div className="absolute bottom-[-240px] right-[-160px] h-[460px] w-[460px] rounded-full bg-[#D9C9A7]/14 blur-[130px]" />
        <div className="absolute bottom-[18%] left-[-180px] h-[360px] w-[360px] rounded-full bg-[#7C8CFF]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[920px]">
        <div className="mx-auto flex w-full max-w-[760px] flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7C8CFF]/20 bg-[#7C8CFF]/[0.08] px-4 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7C8CFF] shadow-[0_0_14px_rgba(124,140,255,0.8)]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#C7D0FF]/82">
              GEORGE by BRANESx
            </span>
          </div>

          <h1 className="mt-6 max-w-[780px] text-[36px] font-semibold leading-[1.04] tracking-[-0.055em] text-white md:mt-8 md:text-[72px] md:leading-[1.02]">
            Whatever you want to be, or build — just ask GEORGE.
          </h1>

          <p className="mt-6 max-w-[680px] text-[15px] leading-7 text-white/68 md:mt-7 md:text-[18px] md:leading-8">
            Build with GEORGE. Interview with GEORGE. Walk GEORGE into meetings, negotiations, briefings, and pressure conversations. Use LIVE when words, timing, and direction matter.
          </p>

          <div className="mt-7 flex w-full max-w-[520px] flex-col gap-3 md:mt-9">
            <Link
              href="/george"
              className="rounded-2xl bg-white px-6 py-3.5 text-[15px] font-semibold text-[#11131A] shadow-[0_22px_70px_rgba(255,255,255,0.12)] transition hover:translate-y-[-1px] hover:bg-[#F5F1E8] md:py-4"
            >
              Enter GEORGE
            </Link>

            <Link
              href="/george?live=1"
              className="rounded-2xl border border-[#7C8CFF]/24 bg-[#7C8CFF]/[0.10] px-6 py-3.5 text-[15px] font-semibold text-[#C7D0FF] shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl transition hover:bg-[#7C8CFF]/[0.16] hover:text-white md:py-4"
            >
              Enter GEORGE LIVE
            </Link>
          </div>

          <div className="mt-8 flex max-w-[720px] flex-wrap justify-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white/50 md:mt-10">
            {['Build', 'Decide', 'Write', 'Learn', 'Prepare', 'Negotiate', 'Interview', 'Meet'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#7C8CFF]/18 bg-[#7C8CFF]/[0.06] px-3.5 py-2 backdrop-blur-xl"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-7 max-w-[660px] rounded-[1.6rem] border border-[#D9C9A7]/12 bg-[#D9C9A7]/[0.045] px-5 py-4 text-[13px] leading-6 text-white/54 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl md:mt-9 md:text-[14px] md:leading-7">
            Normal GEORGE helps you think and act. GEORGE LIVE helps you carry that direction into real conversations.
          </div>

          <div className="mt-7 text-[10px] tracking-[0.18em] text-white/28">
            BRANESx by R. Block Share Holdings, LLC
          </div>
        </div>
      </div>
    </main>
  )
}
