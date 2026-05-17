import Link from 'next/link'

export default function RootPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#06070A] px-5 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0A0C10_0%,#06070A_46%,#050609_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.045]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,12,16,0.38),rgba(8,10,14,0.24)_36%,rgba(6,7,10,0.52)_70%,rgba(6,7,10,0.92)_100%)]" />
        <div className="absolute left-1/2 top-[-90px] h-[92%] w-[1180px] -translate-x-1/2 overflow-hidden rounded-[1.8rem] bg-[linear-gradient(105deg,rgba(10,12,16,0.30),rgba(18,20,26,0.12)_44%,rgba(7,10,17,0.26))] opacity-76">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(174,182,255,0.045),transparent_24%),radial-gradient(circle_at_74%_30%,rgba(126,160,190,0.035),transparent_18%),radial-gradient(circle_at_38%_66%,rgba(20,48,76,0.12),transparent_28%)]" />
          <div className="absolute left-[6%] top-[182px] h-px w-[84%] bg-gradient-to-r from-transparent via-[#9BB8CF]/10 to-transparent" />
          <div className="absolute left-[12%] top-[248px] h-px w-[72%] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
          <div className="absolute left-[20%] top-[378px] h-px w-[64%] bg-gradient-to-r from-transparent via-[#7EC9DA]/10 to-transparent" />
          <div className="absolute left-[28%] top-[520px] h-px w-[48%] bg-gradient-to-r from-transparent via-[#9BB8CF]/8 to-transparent" />
          <div className="absolute left-[18%] top-[168px] h-2 w-2 rounded-[0.25rem] bg-white/[0.04]" />
          <div className="absolute left-[42%] top-[238px] h-2.5 w-2.5 rounded-[0.3rem] bg-[#8FB6C9]/10" />
          <div className="absolute left-[63%] top-[164px] h-3 w-3 rounded-[0.35rem] bg-[#8FB6C9]/5" />
          <div className="absolute right-[5%] top-[112px] h-24 w-24 rounded-full border border-[#8FB6C9]/7" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-transparent via-[#06070A]/58 to-[#06070A]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[720px] flex-col items-center px-6 text-center">
        <img
          src="/logofav.png"
          alt="BRANESx"
          className="mb-8 h-36 w-36 rounded-[2.1rem] object-contain opacity-95"
        />

        <div className="mb-3 text-[10px] font-medium tracking-[0.28em] text-white/34">
          OPERATIONAL INTELLIGENCE
        </div>
        <h1 className="max-w-[640px] text-[34px] font-semibold leading-[1.05] tracking-[-0.055em] text-white/94 md:text-[52px]">
          Bring the situation. Get the next move.
        </h1>
        <p className="mt-5 max-w-[620px] text-[15px] leading-7 text-white/62 md:text-[17px]">
          Use GEORGE to plan, decide, prepare, respond, and keep momentum when the next step matters.
        </p>

        <div className="mt-8 grid w-full max-w-[560px] gap-4 rounded-[1.25rem] border border-white/[0.024] bg-black/[0.10] p-4 text-left">
          <div className="flex items-center justify-between border-b border-white/[0.032] pb-3 text-[11px] tracking-[0.18em] text-white/34">
            <span>UTILITY</span>
            <span className="text-white/38">ASK → MOVE → CONTINUE</span>
          </div>

          <div className="grid gap-4 text-[13px] leading-6 text-white/58">
            <div className="rounded-[0.85rem] border border-white/[0.025] bg-black/[0.12] p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/32">GEORGE</p>
              <p className="mt-3 text-[16px] leading-7 text-white/58">Turn a goal, problem, document, idea, or decision into a useful next step.</p>
            </div>

            <div className="rounded-[0.85rem] border border-white/[0.055] bg-white/[0.014] p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/52">GEORGE LIVE</p>
              <p className="mt-3 text-[16px] leading-7 text-white/66">Use LIVE when the room matters: interviews, negotiations, calls, meetings, conflict, presentations, or moments where words and timing count.</p>
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
            className="flex items-center justify-center rounded-[1.15rem] border border-white/[0.055] bg-white/[0.018] px-6 py-4 text-[15px] font-semibold text-white/82 transition hover:border-white/[0.09] hover:bg-white/[0.032] hover:text-white"
          >
            Prepare LIVE
          </Link>
        </div>

        <p className="mt-5 text-[12px] leading-5 text-white/32">
          GEORGE starts free. LIVE Conversation begins with Intelligent.
        </p>
      </div>
    </main>
  )
}
