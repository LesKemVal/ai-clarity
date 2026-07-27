'use client'

import { requestFreshNormalBrowserSession } from '@/lib/george/session/store'

const productStages = [
  {
    title: 'Prepare',
    body: 'Clarify the outcome, understand the room, organize what matters, identify risks, and practice the moments that may decide the conversation.',
  },
  {
    title: 'Support',
    body: 'During the conversation, GEORGE recognizes useful signals and provides discreet guidance while the outcome can still change.',
  },
  {
    title: 'Review',
    body: 'Afterward, GEORGE explains what mattered, preserves the evidence, and helps you improve the next conversation.',
  },
]

export function HomeHeroSequence() {
  const startNormal = () => {
    requestFreshNormalBrowserSession()
    window.location.href = '/george'
  }

  const startLive = () => {
    window.localStorage.setItem('george_start_new_live', '1')
    window.location.href = '/george/live-entry?source=start'
  }

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(55,183,255,0.12),transparent_30%),radial-gradient(circle_at_82%_72%,rgba(78,124,255,0.09),transparent_34%),linear-gradient(180deg,#050607_0%,#000_100%)]" />

      <button
        type="button"
        onClick={startNormal}
        className="absolute left-5 top-5 z-40 flex h-[58px] w-[58px] items-center justify-center"
        aria-label="Open GEORGE"
      >
        <img
          src="/logofav.png"
          alt="Bx"
          className="h-[52px] w-[52px] object-contain opacity-95"
        />
      </button>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1500px] flex-col px-5 pb-7 pt-28 sm:px-8 sm:pb-8 lg:px-[6.5%] lg:pt-32">
        <div className="max-w-[1050px]">
          <div className="inline-flex w-fit items-center rounded-full border border-[#7EA1FF]/32 bg-[#4E7CFF] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-white shadow-[0_8px_24px_rgba(20,61,168,0.18)]">
            GEORGE
          </div>

          <h1 className="mt-6 max-w-[980px] font-mono text-[44px] font-black uppercase leading-[0.88] tracking-[-0.075em] text-white sm:text-[70px] md:text-[88px]">
            Ask GEORGE.
          </h1>

          <p className="mt-6 max-w-[900px] font-mono text-[21px] font-semibold uppercase leading-[1.12] tracking-[0.055em] text-white/94 sm:text-[30px] md:text-[38px]">
            Operational intelligence for conversations that matter.
          </p>

          <div className="mt-7 max-w-[860px] space-y-4 text-[16px] leading-8 text-white/72 sm:text-[18px] sm:leading-9">
            <p>
              Most AI answers questions. GEORGE helps you accomplish objectives.
            </p>
            <p>
              It helps you prepare before important conversations, supports you while they are happening, and helps you review what happened afterward.
            </p>
          </div>
        </div>

        <div className="mt-10 grid max-w-[1120px] gap-3 md:grid-cols-3">
          {productStages.map((stage) => (
            <article
              key={stage.title}
              className="rounded-[22px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm"
            >
              <h2 className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-white">
                {stage.title}
              </h2>
              <p className="mt-4 text-[14px] leading-6 text-white/64">
                {stage.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-auto pt-10">
          <div className="mx-auto max-w-[1040px] rounded-[26px] border border-white/12 bg-black/42 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.62)] backdrop-blur-xl sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={startNormal}
                className="group flex h-[56px] w-full items-center justify-between rounded-[17px] bg-white px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.26em] text-black transition hover:-translate-y-[1px]"
              >
                <span>
                  Ask GEORGE{' '}
                  <span className="text-black/45">(Prepare)</span>
                </span>
                <span className="text-[20px] transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              <button
                type="button"
                onClick={startLive}
                className="group flex h-[56px] w-full items-center justify-between rounded-[17px] border border-[#7EA1FF]/35 bg-[#4E7CFF] px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(20,61,168,0.22)] transition hover:-translate-y-[1px] hover:bg-[#5B86FF]"
              >
                <span>
                  LIVE Support{' '}
                  <span className="text-white/70">(Execute)</span>
                </span>
                <span className="text-[20px] transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = '/help'
                }}
                className="group flex h-[56px] w-full items-center justify-between rounded-[17px] border border-white/14 bg-black px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:-translate-y-[1px] hover:border-white/24 hover:bg-white/[0.03]"
              >
                <span>
                  Help{' '}
                  <span className="text-white/42">(How to use GEORGE)</span>
                </span>
                <span className="text-[18px] text-white/66 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
