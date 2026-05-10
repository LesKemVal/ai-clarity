import Link from 'next/link'

const signals = ['Conversation', 'Direction', 'Pressure', 'Memory', 'Execution']

export default function RootPage() {
  return (
    <main className="min-h-screen bg-[#F6F3EC] text-[#11131A]">
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden px-5 pb-10 pt-10 md:px-10 md:pt-14">
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#7C8CFF]/18 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-260px] right-[-180px] h-[520px] w-[520px] rounded-full bg-[#D8C6A3]/32 blur-[120px]" />

        <header className="relative z-10 flex items-center justify-between">
          <div className="text-[13px] font-semibold tracking-[0.22em] text-[#1D2433]/70">
            BRANESx
          </div>

          <Link
            href="/george"
            className="rounded-full border border-[#11131A]/10 bg-white/55 px-4 py-2 text-[13px] font-medium text-[#11131A]/70 shadow-[0_12px_30px_rgba(17,19,26,0.06)] backdrop-blur-xl transition hover:bg-white hover:text-[#11131A]"
          >
            Open GEORGE
          </Link>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-[980px] flex-1 flex-col justify-center py-16 md:py-24">
          <div className="mb-6 inline-flex w-fit rounded-full border border-[#11131A]/10 bg-white/55 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#11131A]/55 shadow-[0_16px_40px_rgba(17,19,26,0.05)] backdrop-blur-xl">
            Smart utility for real life
          </div>

          <h1 className="max-w-[880px] text-[54px] font-semibold leading-[0.95] tracking-[-0.065em] text-[#11131A] md:text-[92px]">
            Clarity under pressure.
          </h1>

          <p className="mt-7 max-w-[680px] text-[18px] leading-8 text-[#343844]/72 md:text-[22px] md:leading-9">
            GEORGE helps you think clearer, respond faster, stay composed, and move forward when timing matters.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {signals.map((signal) => (
              <span
                key={signal}
                className="rounded-full border border-[#11131A]/10 bg-white/45 px-3.5 py-2 text-[12px] font-medium text-[#11131A]/58 shadow-[0_10px_28px_rgba(17,19,26,0.045)] backdrop-blur-xl"
              >
                {signal}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/george"
              className="rounded-2xl bg-[#11131A] px-6 py-4 text-center text-[15px] font-semibold text-white shadow-[0_22px_60px_rgba(17,19,26,0.20)] transition hover:translate-y-[-1px] hover:bg-[#1C2230]"
            >
              Start with GEORGE
            </Link>

            <Link
              href="/george?live=1"
              className="rounded-2xl border border-[#11131A]/12 bg-white/55 px-6 py-4 text-center text-[15px] font-semibold text-[#11131A]/72 shadow-[0_18px_48px_rgba(17,19,26,0.07)] backdrop-blur-xl transition hover:translate-y-[-1px] hover:bg-white hover:text-[#11131A]"
            >
              See LIVE mode
            </Link>
          </div>

          <div className="mt-16 max-w-[780px] rounded-[2rem] border border-[#11131A]/10 bg-white/45 p-5 shadow-[0_24px_70px_rgba(17,19,26,0.08)] backdrop-blur-2xl md:p-7">
            <p className="text-[18px] font-medium leading-8 text-[#11131A]/82 md:text-[22px] md:leading-9">
              Pull up to an interview, boardroom, classroom, negotiation, or difficult conversation with GEORGE.
            </p>

            <p className="mt-4 text-[15px] leading-7 text-[#343844]/68 md:text-[17px] md:leading-8">
              LIVE helps you recover faster, think clearer, speak stronger, and catch the moment before it slips.
            </p>

            <p className="mt-4 text-[15px] leading-7 text-[#343844]/68 md:text-[17px] md:leading-8">
              Train GEORGE during everyday conversation and it begins to understand how you think, speak, hesitate, negotiate, and move.
            </p>

            <div className="mt-5 text-[15px] font-semibold leading-7 text-[#11131A]/82 md:text-[17px]">
              GEORGE helps you stay sharp.
              <br />
              GEORGE helps you stay remembered.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
