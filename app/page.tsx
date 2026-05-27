'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [active, setActive] = useState<'normal' | 'live' | null>(null)

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#040507] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(120,140,170,0.08),transparent_32%),linear-gradient(180deg,rgba(4,5,7,0.78),rgba(4,5,7,0.94))]" />

        <div
          className={`absolute inset-0 transition duration-700 ${
            active === 'live'
              ? 'bg-[#020304]/42'
              : active === 'normal'
                ? 'bg-[#091018]/18'
                : 'bg-transparent'
          }`}
        />

        <div className="absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.015] blur-3xl" />
      </div>

      <section className="relative z-10 flex w-full max-w-[760px] flex-col items-center px-8 text-center">
        <div className="mb-8">
          <img
            src="/logofav.png"
            alt="Bx"
            className={`mx-auto h-20 w-20 object-contain transition duration-700 ${
              active ? 'scale-[1.02] opacity-100' : 'opacity-[0.92]'
            }`}
          />

          <div className="mt-5 text-[12px] uppercase tracking-[0.42em] text-white/58">
            BRANESx
          </div>
        </div>

        <div className="max-w-[460px] text-[15px] leading-7 text-white/42">
          Operational intelligence for thinking clearly, moving deliberately, and handling moments where words matter.
        </div>

        <div className="mt-16 flex w-full max-w-[520px] flex-col gap-5">
          <Link
            href="/george"
            onMouseEnter={() => setActive('normal')}
            onMouseLeave={() => setActive(null)}
            onTouchStart={() => setActive('normal')}
            className="group relative overflow-hidden rounded-[1.4rem] border border-white/[0.045] bg-white/[0.02] px-6 py-5 transition duration-500 active:scale-[0.992]"
          >
            <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
              <div className="absolute inset-y-0 left-[-35%] w-[40%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent blur-xl transition-all duration-1000 group-hover:left-[120%]" />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="text-left">
                <div className="text-[12px] uppercase tracking-[0.34em] text-white/76">
                  NORMAL
                </div>

                <div className="mt-2 text-[14px] leading-6 text-white/40">
                  Think, decide, prepare, build.
                </div>
              </div>

              <div className="text-[12px] tracking-[0.24em] text-white/24 transition duration-300 group-hover:text-white/58">
                GEORGE
              </div>
            </div>
          </Link>

          <Link
            href="/george/live-entry"
            onMouseEnter={() => setActive('live')}
            onMouseLeave={() => setActive(null)}
            onTouchStart={() => setActive('live')}
            className="group relative overflow-hidden rounded-[1.4rem] border border-white/[0.05] bg-[#0A1016]/32 px-6 py-5 transition duration-500 active:scale-[0.992]"
          >
            <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
              <div className="absolute inset-y-0 left-[-35%] w-[40%] rotate-[18deg] bg-gradient-to-r from-transparent via-[#B7D4E8]/[0.08] to-transparent blur-xl transition-all duration-1000 group-hover:left-[120%]" />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="text-left">
                <div className="text-[12px] uppercase tracking-[0.34em] text-white/82">
                  LIVE
                </div>

                <div className="mt-2 text-[14px] leading-6 text-white/42">
                  Bring GEORGE into the room.
                </div>
              </div>

              <div className="text-[12px] tracking-[0.24em] text-white/24 transition duration-300 group-hover:text-white/62">
                ACTIVE
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-14 text-[10px] uppercase tracking-[0.28em] text-white/18">
          Direction → Action → Signal
        </div>
      </section>
    </main>
  )
}
