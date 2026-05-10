import Link from 'next/link'

const tiers = [
  {
    name: 'Smart',
    description: 'Direction, continuity, and everyday support.',
  },
  {
    name: 'Intelligent',
    description: 'LIVE conversation access, stronger continuity, and adaptive guidance.',
  },
  {
    name: 'Brilliant',
    description: 'Deeper conversational support, expanded continuity, and premium LIVE capabilities.',
  },
]

export default function RootPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F1E8] px-6 text-[#11131A]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-240px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#7C8CFF]/10 blur-[120px]" />
        <div className="absolute bottom-[-260px] right-[-180px] h-[460px] w-[460px] rounded-full bg-[#D9C9A7]/18 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-[760px] flex-col items-center text-center">
        <div className="text-[11px] font-medium tracking-[0.22em] text-[#11131A]/42">
          GEORGE by BRANESx
        </div>

        <h1 className="mt-7 max-w-[720px] text-[42px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#11131A] md:text-[68px]">
          GEORGE stays with you through real situations and real conversations.
        </h1>

        <div className="mt-10 flex w-full max-w-[520px] flex-col gap-3">
          <Link
            href="/george"
            className="rounded-2xl bg-[#11131A] px-6 py-4 text-[15px] font-semibold text-white shadow-[0_20px_60px_rgba(17,19,26,0.16)] transition hover:translate-y-[-1px] hover:bg-[#1B2230]"
          >
            Enter GEORGE
          </Link>

          <Link
            href="/george?live=1"
            className="rounded-2xl border border-[#11131A]/10 bg-white/55 px-6 py-4 text-[15px] font-semibold text-[#11131A]/72 shadow-[0_18px_40px_rgba(17,19,26,0.05)] backdrop-blur-xl transition hover:bg-white hover:text-[#11131A]"
          >
            Enter GEORGE (LIVE)
          </Link>
        </div>

        <div className="mt-7 max-w-[620px] text-[15px] leading-7 text-[#343844]/66 md:text-[16px]">
          Take GEORGE into interviews, classrooms, negotiations, boardrooms, and difficult conversations.
          LIVE helps with timing, pressure, recovery, response support, and staying composed while conversations are happening.
        </div>

        <div className="mt-12 grid w-full gap-3 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="rounded-[1.6rem] border border-[#11131A]/08 bg-white/38 px-4 py-5 backdrop-blur-xl"
            >
              <div className="text-[13px] font-semibold tracking-[-0.02em] text-[#11131A]">
                {tier.name}
              </div>

              <div className="mt-2 text-[13px] leading-6 text-[#343844]/62">
                {tier.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
