import Link from 'next/link'

export default function RootPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#080A12] px-5 py-6 text-white md:px-6 md:py-8">
      <img
        src="/landing/city02.png"
        alt=""
        className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-[0.42] blur-[0.8px]"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(124,140,255,0.14),transparent_36%),linear-gradient(180deg,rgba(8,10,18,0.62)_0%,rgba(8,10,18,0.82)_52%,rgba(8,10,18,0.96)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,10,18,0.94)_0%,rgba(8,10,18,0.66)_48%,rgba(8,10,18,0.94)_100%)]" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-260px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#7C8CFF]/18 blur-[140px]" />
        <div className="absolute bottom-[-240px] right-[-160px] h-[460px] w-[460px] rounded-full bg-[#D9C9A7]/14 blur-[130px]" />
        <div className="absolute bottom-[18%] left-[-180px] h-[360px] w-[360px] rounded-full bg-[#7C8CFF]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[920px]">
        <div className="mx-auto flex w-full max-w-[760px] flex-col items-center text-center">
          <img
            src="/bxx34.png"
            alt="BRANESx"
            className="h-10 w-auto object-contain opacity-95 drop-shadow-[0_18px_42px_rgba(0,0,0,0.32)] md:h-12"
          />

          <h1 className="mt-5 max-w-[760px] text-[34px] font-semibold leading-[1.04] tracking-[-0.055em] text-white md:mt-7 md:text-[70px] md:leading-[1.02]">
            Whatever you want to be, or build — just ask GEORGE.
          </h1>

          <p className="mt-5 max-w-[640px] text-[15px] leading-7 text-white/64 md:mt-6 md:text-[18px] md:leading-8">
            Ask GEORGE anything — or wear one earbud and use GEORGE in interviews, meetings, appointments, negotiations, sales calls, and wherever words matter. Keep the conversational advantage.
          </p>

          <div className="mt-6 flex w-full max-w-[500px] flex-col gap-3 md:mt-8">
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

          <div className="mt-7 text-[10px] tracking-[0.18em] text-white/28">
            BRANESx by R. Block Share Holdings, LLC
          </div>
        </div>
      </div>
    </main>
  )
}
