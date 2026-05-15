import Link from 'next/link'

const LIVE_CONTEXTS = [
  'Interview',
  'Meeting',
  'Boardroom',
  'Negotiation',
  'Sales Call',
  'Doctor Appointment',
  'Presentation',
  'Everyday Conversation',
]

export default function GeorgeLiveEntryPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#06070A] px-5 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,140,255,0.08),transparent_34%),linear-gradient(180deg,#06070A_0%,#090B10_52%,#06070A_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[760px] flex-col items-center px-6 text-center">
        <img
          src="/bxnew20.png"
          alt="BRANESx"
          className="mb-7 h-7 w-auto object-contain opacity-78"
        />

        <div className="mb-3 text-[10px] font-medium tracking-[0.28em] text-white/34">
          LIVE MODE
        </div>

        <h1 className="text-[34px] font-semibold tracking-[-0.055em] text-white md:text-[56px]">
          GEORGE LIVE
        </h1>

        <p className="mt-5 max-w-[680px] text-[15px] leading-7 text-white/62 md:text-[17px]">
          LIVE is built for moments where wording, timing, pressure, and response quality matter in real time.
        </p>

        <div className="mt-8 w-full max-w-[640px] rounded-[1.35rem] border border-white/[0.055] bg-white/[0.018] p-5 text-left">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 text-[11px] tracking-[0.18em] text-white/38">
            <span>SELECT A ROOM</span>
            <span className="text-[#AEB6FF]/72">OPTIONAL</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {LIVE_CONTEXTS.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-full border border-white/[0.06] bg-black/30 px-3 py-2 text-[13px] text-white/58 transition hover:border-[#7C8CFF]/22 hover:bg-[#7C8CFF]/[0.05] hover:text-white"
              >
                {item}
              </button>
            ))}
          </div>

          <p className="mt-5 text-[13px] leading-6 text-white/46">
            Use one earbud if possible. Speak naturally. GEORGE will follow the room and assist when useful.
          </p>
        </div>

        <div className="mt-7 grid w-full max-w-[420px] gap-3">
          <Link
            href="/george/live"
            className="flex items-center justify-center rounded-[1.15rem] bg-white px-6 py-4 text-[15px] font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
          >
            Enter LIVE
          </Link>

          <Link
            href="/george/live"
            className="flex items-center justify-center rounded-[1.15rem] border border-white/[0.06] bg-white/[0.018] px-6 py-4 text-[14px] font-medium text-white/52 transition hover:border-white/[0.12] hover:text-white"
          >
            Skip — I need help now
          </Link>
        </div>
      </div>
    </main>
  )
}
