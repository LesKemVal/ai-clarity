import Link from 'next/link'

export default function RootPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#06070A] px-5 py-8 text-white">

      <img
        src="/landing/city02.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.26]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,10,0.72)_0%,rgba(6,7,10,0.90)_52%,rgba(6,7,10,0.98)_100%)]" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-220px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#7C8CFF]/[0.055] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[760px] flex-col items-center px-6 text-center">

        <img
          src="/bxnew20.png"
          alt="BRANESx"
          className="mb-6 h-8 w-auto object-contain opacity-75"
        />

        <div className="mb-2 text-[10px] font-medium tracking-[0.24em] text-white/34">
          INTELLIGENT UTILITY
        </div>

        <h1 className="text-[30px] font-semibold tracking-[-0.05em] text-white md:text-[52px]">
          GEORGE
        </h1>

        <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-white/62 md:text-[17px]">
          Ask GEORGE anything.
          The power of OpenAI aligned with YOUR core principles.
          GEORGE will not contradict The Holy Bible (KJV).
        </p>

        <Link
          href="/george"
          className="mt-7 flex w-full max-w-[420px] items-center justify-center rounded-[1.15rem] bg-white px-6 py-4 text-[15px] font-semibold text-[#0B0D12] transition hover:translate-y-[-1px] hover:bg-[#F3F5F7]"
        >
          Enter GEORGE
        </Link>

        <div className="mt-10 h-px w-full max-w-[460px] bg-white/[0.06]" />

        <h2 className="mt-10 text-[28px] font-semibold tracking-[-0.045em] text-white md:text-[40px]">
          GEORGE LIVE
        </h2>

        <p className="mt-4 max-w-[700px] text-[15px] leading-7 text-white/62 md:text-[17px]">
          Take advantage of advanced runtime logic, real-time conversational awareness, and live response shaping — and take GEORGE LIVE anywhere.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] tracking-[0.14em] text-white/40 md:text-[12px]">
          <span>INTERVIEWS</span>
          <span>•</span>
          <span>BOARDROOMS</span>
          <span>•</span>
          <span>CLASSROOMS</span>
          <span>•</span>
          <span>SALES</span>
          <span>•</span>
          <span>NEGOTIATIONS</span>
          <span>•</span>
          <span>APPOINTMENTS</span>
          <span>•</span>
          <span>EVERYDAY CONVERSATION</span>
        </div>

        <p className="mt-6 max-w-[620px] text-[14px] leading-7 text-white/48">
          Upload your résumé. Prepare for the room. Adapt in real time.
          The more context GEORGE has, the sharper the assistance becomes.
        </p>

        <Link
          href="/george?live=segue"
          className="mt-7 flex w-full max-w-[420px] items-center justify-center rounded-[1.15rem] border border-[#7C8CFF]/18 bg-[#7C8CFF]/[0.08] px-6 py-4 text-[15px] font-semibold text-[#D7DDFF] transition hover:bg-[#7C8CFF]/[0.14] hover:text-white"
        >
          Enter GEORGE LIVE
        </Link>

        <div className="mt-5 text-[13px] text-white/34">
          LIVE access from $10
        </div>

      </div>
    </main>
  )
}
