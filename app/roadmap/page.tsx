'use client'

import { useEffect, useState } from 'react'
import PageShell from '@/components/layout/PageShell'

const images = ["/hero/world.svg"]

const pillars = [
  {
    title: 'Clarity under pressure',
    text: 'GEORGE is being built to help people see the real move when confusion, delay, and pressure start distorting judgment.',
  },
  {
    title: 'Direction that holds',
    text: 'Not just one good answer. A usable direction that can survive changing conditions, missing information, and real-life friction.',
  },
  {
    title: 'Execution over drift',
    text: 'The point is not conversation. The point is movement, follow-through, and finishing what actually matters.',
  },
]

const roadmapItems = [
  'Stronger continuity across sessions',
  'Better multi-goal support with a clear primary track',
  'Sharper rerouting when the plan changes',
  'Faster responses that still preserve judgment',
  'Voice where it improves speed, not where it adds noise',
  'A more useful operating presence in daily life',
]

export default function RoadmapPage() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 2800)

    return () => clearInterval(interval)
  }, [])

  return (
    <PageShell title="Roadmap" eyebrow="Direction" backToGeorge withSidebar={false}>
      <div className="max-w-5xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-800 bg-black shadow-[0_18px_60px_rgba(0,0,0,0.6)]">
          <div className="relative h-[300px] w-full md:h-[360px] lg:h-[400px] flex items-center justify-end pr-10">
            {images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt="Cute smart smiling alien"
                className={`absolute inset-0 h-full w-full object-contain object-right transition-all duration-700 ${
                  i === index ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
                }`}
              />
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <div className="max-w-3xl space-y-3">
                <p className="text-sm uppercase tracking-[0.18em] text-[#7C8CFF]">
                  Global. Clear. In motion.
                </p>

                <h2 className="max-w-3xl text-2xl font-semibold leading-tight text-white md:text-4xl">
                  GEORGE helps you think at world scale.
                </h2>

                <p className="max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
                  A clear mind, a wider view, and a better next move.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              What this roadmap is really about
            </p>

            <h2 className="text-2xl font-semibold tracking-tight text-white">
              This is being built for when things are unclear—and still matter.
            </h2>

            <p className="text-sm leading-7 text-neutral-400 md:text-base">
              Most tools work when conditions are clean. GEORGE is being built for when they are not.
            </p>

            <p className="text-sm leading-7 text-neutral-400 md:text-base">
              Pressure, uncertainty, incomplete information—this is where decisions break down.
            </p>

            <p className="text-white">
              The goal is to help you see clearly, choose direction, and keep moving anyway.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur"
            >
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-neutral-400">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/40 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                What’s coming
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                The next improvements are practical.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {roadmapItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-neutral-800 bg-black/25 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
                >
                  <p className="text-sm leading-7 text-neutral-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            The point
          </h2>

          <div className="mt-5 space-y-5 text-sm leading-8 text-neutral-400 md:text-base">
            <p>
              GEORGE is not here to decorate your screen or keep you company.
            </p>

            <p>
              GEORGE is here to help you think clearly, move with direction, and
              stay with the work long enough to produce a result.
            </p>

            <p className="text-neutral-200">
              If it matters, GEORGE helps you finish it.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
