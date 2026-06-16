'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  const startLive = () => {
    window.localStorage.setItem('george_start_new_live', '1')
    router.push('/george/live-entry?source=start')
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#030405] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_54%_34%,rgba(174,182,255,0.075),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_18%,rgba(255,255,255,0.018))]" />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[760px] flex-col px-6 py-5">
        <header className="flex items-center justify-between border-b border-white/[0.11] pb-5">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => router.push('/george')}
              className="flex h-[46px] w-[46px] items-center justify-center"
              aria-label="Open GEORGE"
            >
              <img src="/logofav.png" alt="Bx" className="h-[42px] w-[42px] object-contain opacity-95" />
            </button>
            <div className="text-[13px] uppercase tracking-[0.42em] text-white/76">
              BRANESx
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'GEORGE by BRANESx', url: window.location.href }).catch(() => {})
              }
            }}
            className="text-[10px] uppercase tracking-[0.32em] text-white/62"
          >
            Share
          </button>
        </header>

        <section className="flex flex-1 flex-col justify-between">
          <div className="pt-10">
            <h1 className="text-[72px] font-semibold leading-[0.88] tracking-[-0.078em] text-white sm:text-[104px]">
              Ask<br />
              <span className="text-[#BFC7FF]">GEORGE.</span>
            </h1>

            <div className="mt-7 inline-block rounded-[18px] border border-white/[0.08] bg-black/35 px-4 py-3 shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-sm">
              <p className="text-[18px] uppercase leading-[1.8] tracking-[0.34em] text-white/90">
                Plan. Decide.<br />
                Prepare. Build.
              </p>

              <p className="mt-4 max-w-[520px] text-[12px] uppercase leading-6 tracking-[0.22em] text-white/54">
                Use GEORGE LIVE during interviews, negotiations, presentations, board meetings, doctor visits, and everyday conversations.
              </p>
            </div>
          </div>

          <div className="relative mx-auto my-8 h-[300px] w-full max-w-[520px] sm:h-[360px]">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 360" aria-hidden="true">
              <defs>
                <filter id="earGlow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Head anchor */}
              <line x1="255" y1="192" x2="135" y2="58" stroke="rgba(191,199,255,0.38)" strokeWidth="1" />
              <line x1="255" y1="192" x2="255" y2="70" stroke="rgba(191,199,255,0.34)" strokeWidth="1" />
              <line x1="255" y1="192" x2="378" y2="78" stroke="rgba(191,199,255,0.34)" strokeWidth="1" />

              <circle cx="135" cy="58" r="3" fill="#BFC7FF" />
              <circle cx="255" cy="70" r="3" fill="#BFC7FF" />
              <circle cx="378" cy="78" r="3" fill="#BFC7FF" />

              {/* Stick figure */}
              <circle cx="244" cy="196" r="27" fill="transparent" stroke="rgba(255,255,255,0.86)" strokeWidth="2" />
              <circle cx="260" cy="200" r="5" fill="#BFC7FF" filter="url(#earGlow)" />
              <line x1="244" y1="223" x2="244" y2="286" stroke="rgba(255,255,255,0.82)" strokeWidth="2" />
              <line x1="244" y1="238" x2="222" y2="278" stroke="rgba(255,255,255,0.78)" strokeWidth="2" />
              <line x1="244" y1="238" x2="266" y2="278" stroke="rgba(255,255,255,0.78)" strokeWidth="2" />
            </svg>

            <div className="absolute left-[9%] top-[8%] text-[12px] uppercase tracking-[0.34em] text-white/86">
              Investor
            </div>
            <div className="absolute left-[46%] top-[13%] text-[12px] uppercase tracking-[0.34em] text-white/86">
              CEO
            </div>
            <div className="absolute right-[12%] top-[15%] text-[12px] uppercase tracking-[0.34em] text-white/86">
              Teacher
            </div>
          </div>

          <div className="-mt-24 border-t border-white/[0.105] pt-5 sm:-mt-28">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => router.push('/george')}
                className="group flex h-[72px] items-center justify-between rounded-[18px] bg-white px-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-black transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_16px_44px_rgba(255,255,255,0.18)] active:translate-y-0"
              >
                <span>Ask GEORGE</span>
                <span className="text-[24px] transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>

              <button
                type="button"
                onClick={startLive}
                className="group flex h-[72px] items-center justify-between rounded-[18px] bg-[#BFC7FF] px-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-black transition-all duration-300 hover:bg-[#D2D7FF] hover:shadow-[0_16px_48px_rgba(191,199,255,0.30)] active:scale-[0.985]"
              >
                <span>Go LIVE</span>
                <span className="text-[24px] transition-transform duration-300 group-hover:translate-x-1 group-hover:-rotate-6">→</span>
              </button>
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between pt-5 text-[10px] uppercase tracking-[0.36em] text-white/56">
          <span>BRANESx</span>
          <span>2026</span>
        </footer>
      </div>
    </main>
  )
}
