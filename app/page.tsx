import Link from 'next/link'

export default function RootPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#F5F1E8] px-5 py-6 text-[#11131A] md:px-6 md:py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-240px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#7C8CFF]/10 blur-[120px]" />
        <div className="absolute bottom-[-260px] right-[-180px] h-[460px] w-[460px] rounded-full bg-[#D9C9A7]/18 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-[720px] flex-col items-center text-center">
        <div className="text-[10px] font-medium tracking-[0.18em] text-[#11131A]/42">
          GEORGE by BRANESx
        </div>

        <h1 className="mt-5 max-w-[650px] text-[34px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#11131A] md:mt-7 md:text-[64px]">
          Whatever you want to be, build, or go — ask GEORGE.
        </h1>

        <div className="mt-7 flex w-full max-w-[500px] flex-col gap-2.5 md:mt-10 md:gap-3">
          <Link
            href="/george"
            className="rounded-2xl bg-[#11131A] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_20px_60px_rgba(17,19,26,0.16)] transition hover:translate-y-[-1px] hover:bg-[#1B2230] md:py-4"
          >
            Enter GEORGE
          </Link>

          <Link
            href="/george?live=1"
            className="rounded-2xl border border-[#11131A]/10 bg-white/55 px-6 py-3.5 text-[15px] font-semibold text-[#11131A]/72 shadow-[0_18px_40px_rgba(17,19,26,0.05)] backdrop-blur-xl transition hover:bg-white hover:text-[#11131A] md:py-4"
          >
            Enter GEORGE (LIVE)
          </Link>
        </div>

        <div className="mt-6 max-w-[620px] text-[14px] leading-6 text-[#343844]/66 md:mt-8 md:text-[17px] md:leading-8">
          Everything GEORGE offers, plus LIVE conversational support so you are prepared in any classroom, boardroom, briefing — or one-on-one everyday conversation.
        </div>

        <div className="mt-7 grid w-full gap-2.5 md:mt-10 md:grid-cols-3 md:gap-3">
          <div className="rounded-[1.25rem] border border-[#11131A]/10 bg-white/34 px-4 py-3.5 backdrop-blur-xl md:rounded-[1.6rem] md:py-5">
            <div className="text-[13px] font-semibold text-[#11131A]">Smart</div>
            <div className="mt-1.5 text-[12px] leading-5 text-[#343844]/62 md:text-[13px] md:leading-6">
              Direction, continuity, and everyday support.
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-[#11131A]/10 bg-white/34 px-4 py-3.5 backdrop-blur-xl md:rounded-[1.6rem] md:py-5">
            <div className="text-[13px] font-semibold text-[#11131A]">Intelligent</div>
            <div className="mt-1.5 text-[12px] leading-5 text-[#343844]/62 md:text-[13px] md:leading-6">
              LIVE access, stronger continuity, and adaptive guidance.
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-[#11131A]/10 bg-white/34 px-4 py-3.5 backdrop-blur-xl md:rounded-[1.6rem] md:py-5">
            <div className="text-[13px] font-semibold text-[#11131A]">Brilliant</div>
            <div className="mt-1.5 text-[12px] leading-5 text-[#343844]/62 md:text-[13px] md:leading-6">
              Deeper LIVE support, expanded continuity, and premium capabilities.
            </div>
          </div>
        </div>

        <div className="mt-6 text-[10px] tracking-[0.16em] text-[#11131A]/34">
          BRANESx by R. Block Share Holdings, LLC
        </div>
      </div>
    </main>
  )
}
