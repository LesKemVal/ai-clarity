'use client'

import { useEffect, useState } from 'react'
import PageShell from '@/components/layout/PageShell'

const images = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80'
]


export default function LandingPage() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <PageShell
      eyebrow="BRANES"
      title="GEORGE"
      backToGeorge
      withSidebar={false}
    >
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-950/60 shadow-[0_18px_60px_rgba(0,0,0,0.5)] backdrop-blur">
          <div className="relative h-[260px] w-full md:h-[320px] lg:h-[340px]">
            {images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt="Positive, motivated people"
                className={`absolute inset-0 h-full w-full object-cover object-center scale-[1.02] transition-all duration-1000 brightness-90 contrast-110 ${
                  i === index ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
                }`}
              />
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <div className="max-w-3xl space-y-3">
                <p className="text-sm uppercase tracking-[0.18em] text-[#7C8CFF]">
                  When it gets real
                </p>

                <p className="max-w-2xl text-lg font-medium leading-8 text-white md:text-xl">
                  GEORGE helps you see the move—and take it.
                </p>

                <p className="max-w-2xl text-sm leading-7 text-neutral-200 md:text-base">
                  Most people lose momentum when the path gets unclear.
                  GEORGE is built to remove that friction and keep you moving.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => (window.location.href = '/george')}
                    className="rounded-full bg-[#7C8CFF] px-6 py-3 text-sm font-medium text-black transition button-press hover:opacity-90"
                  >
                    Start with moving
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur">
            <p className="text-sm font-medium text-white">See clearly</p>
            <p className="mt-3 text-sm leading-7 text-neutral-400">
              You see what actually matters and what to do next.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur">
            <p className="text-sm font-medium text-white">Decide faster</p>
            <p className="mt-3 text-sm leading-7 text-neutral-400">
              You move forward with the right next step and understand why it works.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur">
            <p className="text-sm font-medium text-white">Finish what matters</p>
            <p className="mt-3 text-sm leading-7 text-neutral-400">
              You keep moving until it’s done, even when conditions change.
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Why people use GEORGE
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Because pressure changes the quality of your thinking.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
              When the stakes rise, most people do not need more noise. They need
              the next move, the real constraint, and a way to keep moving. That
              is what GEORGE is built to do.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
