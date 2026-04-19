'use client'

import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen w-full bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl space-y-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#7C8CFF]">
            Free tier available
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
            GEORGE is about action.
          </h1>

          <p className="max-w-2xl text-base leading-8 text-neutral-300 md:text-lg">
            Be clear. Decide faster. Execute.
          </p>

          <p className="max-w-2xl text-sm leading-7 text-neutral-400">
            Walk in prepared. Stay sharp in the room. Understand what they mean. Respond with confidence. Bring GEORGE with you.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push('/george')}
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:opacity-90"
            >
              Start with GEORGE
            </button>

            <button
              type="button"
              onClick={() => router.push('/top-up')}
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:border-[#7C8CFF] hover:text-[#7C8CFF]"
            >
              Subscribers
            </button>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur">
            <p className="text-sm font-medium text-white">Free</p>
            <p className="mt-3 text-sm leading-7 text-neutral-400">
              Start free and get something useful immediately. Direction, structure, and movement without delay.
            </p>
          </div>

          <div className="rounded-3xl border border-[#7C8CFF]/25 bg-[#7C8CFF]/8 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur">
            <p className="text-sm font-medium text-white">Intelligent</p>
            <p className="mt-3 text-sm leading-7 text-neutral-300">
              Turn ideas into steps, hold continuity longer, and keep the work moving with more structure.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur">
            <p className="text-sm font-medium text-white">Brilliant</p>
            <p className="mt-3 text-sm leading-7 text-neutral-400">
              For heavier work, deeper guidance, and stronger support when multiple tracks are in motion.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
