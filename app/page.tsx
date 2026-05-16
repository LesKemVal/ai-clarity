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
          <div className="absolute left-[6%] top-[148px] h-px w-[84%] bg-gradient-to-r from-transparent via-[#9BB8CF]/16 to-transparent" />
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
          src="/bxnew20.png"
          alt="BRANESx"
          className="mb-8 h-5 w-auto object-contain opacity-64"
        />

        <div className="mb-3 text-[10px] font-medium tracking-[0.28em] text-white/34">
          INTELLIGENT UTILITY
        </div>
        <p className="mt-5 max-w-[620px] text-[15px] leading-7 text-white/62 md:text-[17px]">
          Build businesses. Untangle problems. Prepare for pressure. Sharpen communication. Think clearly under load.
        </p>

        <div className="mt-8 grid w-full max-w-[560px] gap-4 rounded-[1.35rem] border border-white/[0.032] bg-black/[0.16] p-4 text-left backdrop-blur-[0.5px]">
          <div className="flex items-center justify-between border-b border-white/[0.032] pb-3 text-[11px] tracking-[0.18em] text-white/34">
            <span>RUNTIME MODES</span>
            <span className="text-white/38">ACTIVE</span>
          </div>

          <div className="grid gap-4 text-[13px] leading-6 text-white/58">
            <div className="rounded-[0.9rem] bg-black/18 p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/32">GEORGE</p>
              <p className="mt-3 text-[16px] leading-7 text-white/58">Plan, write, compare, prepare, and move from uncertainty to the next useful action. Ask GEORGE.</p>
            </div>

            <div className="rounded-[0.9rem] border border-white/[0.045] bg-white/[0.012] p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/52">GEORGE LIVE</p>
              <p className="mt-3 text-[16px] leading-7 text-white/66">Put GEORGE in your ear and walk into interviews, negotiations, debates, meetings, difficult calls, presentations, or any room where words and timing matter.</p>
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
