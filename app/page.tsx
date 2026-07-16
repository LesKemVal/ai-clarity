'use client'

import { HomeHeroSequence } from '@/components/home/HomeHeroSequence'

const supportModes = [
  {
    title: 'Cue',
    body: 'Minimal text alerts for subtle, timely nudges.',
  },
  {
    title: 'Continuation',
    body: 'Tailored language that helps you finish your thought clearly.',
  },
  {
    title: 'Response',
    body: 'A complete line you can repeat, adapt, shorten, or ignore.',
  },
  {
    title: 'Advice',
    body: 'A practical next move based on the room, pressure, and objective.',
  },
]

const audienceCards = [
  {
    title: 'Professional advancement',
    body: 'Support for critical interviews, investor pitches, contract negotiations, executive presentations, and other conversations where communication can influence a successful outcome.',
  },
  {
    title: 'Speaking disabilities',
    body: 'Support for pressure-induced blocks, word retrieval, pacing, sentence completion, and conversational flow—without taking control away from the person speaking.',
  },
  {
    title: 'Neurodivergent professionals',
    body: 'Support for ADHD, autism, anxiety, processing differences, cognitive overload, pacing, conversational pauses, and social signals that may otherwise be missed.',
  },
]

const impactCards = [
  {
    title: 'Under-served founders',
    body: 'Handle skeptical investor questions, defend strategy, translate metrics into familiar investor language, and redirect risk-heavy questioning toward traction, proof, growth, and market opportunity.',
  },
  {
    title: 'Main Street entrepreneurs',
    body: 'Bridge the gap between technical or trade expertise and the language used by banks, procurement teams, enterprise buyers, RFP panels, and corporate decision-makers.',
  },
  {
    title: 'Professionals and executives',
    body: 'Maintain composure and clarity during interviews, board meetings, reviews, negotiations, sales calls, presentations, and critical internal alignment.',
  },
]

const contextCards = [
  {
    title: 'Role calibration',
    body: 'Founder, executive, candidate, salesperson, negotiator, contractor, parent, patient, or board member. Your role changes what authority you have and what useful support should sound like.',
  },
  {
    title: 'Briefing integration',
    body: 'Desired outcome, acceptable outcome, audience, pressure, risks, constraints, documents, and known context sharpen the guidance before the conversation begins.',
  },
]

const technologyCards = [
  {
    title: 'Fast infrastructure',
    body: 'OpenAI reasoning, Groq low-latency inference, and Deepgram real-time speech recognition support fast operational judgment while the conversation is still unfolding.',
  },
  {
    title: 'Advanced voice technology',
    body: 'Cartesia voice, Next.js, React, and TypeScript support reliable delivery across readable and audio-first receiver profiles.',
  },
  {
    title: 'Future hardware',
    body: 'GEORGE is designed to extend into discreet wearables, audio glasses, readable glasses, live briefing systems, and enterprise communication tools.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <HomeHeroSequence />

      <section className="border-t border-white/10 bg-black px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-[#3657A8]/55 bg-[#172347] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F4F8FF]/88 shadow-[0_8px_26px_rgba(12,27,68,0.28)]">
                Communication intelligence
              </p>

              <h1 className="mt-4 max-w-4xl font-mono text-[36px] font-black uppercase leading-[0.92] tracking-[-0.07em] sm:text-[60px]">
                Communication intelligence for high-stakes moments.
              </h1>
            </div>

            <div className="space-y-5 text-[16px] leading-8 text-white/72">
              <p>
                GEORGE is real-time operational intelligence designed to help
                you navigate, adapt, and succeed in critical conversations.
              </p>

              <p>
                GEORGE supports you before, during, and after important
                meetings—helping you prepare for the moment, recognize what is
                happening, and protect your desired outcome.
              </p>

              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8FB6C9]">
                <span>Prepare</span>
                <span>Perform</span>
                <span>Adapt</span>
                <span>Improve outcomes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-[#3657A8]/55 bg-[#172347] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F4F8FF]/88 shadow-[0_8px_26px_rgba(12,27,68,0.28)]">
                Real-time support
              </p>

              <h2 className="mt-4 max-w-3xl font-mono text-[34px] font-black uppercase leading-[0.94] tracking-[-0.065em] sm:text-[54px]">
                Help while the outcome can still change.
              </h2>
            </div>

            <div className="space-y-5 text-[16px] leading-8 text-white/70">
              <p>
                Typical AI tools summarize meetings after they end. GEORGE
                analyzes live speech and operational signals while the
                conversation is happening.
              </p>

              <p>
                The support changes with the moment. Sometimes you need a brief
                cue. Sometimes you need help finishing a thought, answering a
                difficult question, or choosing the strongest next move.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {supportModes.map((mode) => (
              <article
                key={mode.title}
                className="rounded-[22px] border border-white/10 bg-white/[0.035] p-5"
              >
                <h3 className="font-mono text-[12px] uppercase tracking-[0.24em] text-white">
                  {mode.title}
                </h3>

                <p className="mt-4 text-[14px] leading-6 text-white/62">
                  {mode.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-5xl">
            <p className="inline-flex rounded-full border border-[#3657A8]/55 bg-[#172347] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F4F8FF]/88 shadow-[0_8px_26px_rgba(12,27,68,0.28)]">
              Who we build for
            </p>

            <h2 className="mt-4 font-mono text-[32px] font-black uppercase leading-[0.94] tracking-[-0.065em] sm:text-[50px]">
              High-stakes communication should not block talented people from
              life-changing opportunities.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {audienceCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[26px] border border-white/10 bg-[#090A0B] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)]"
              >
                <h3 className="font-mono text-[13px] uppercase tracking-[0.22em] text-white">
                  {card.title}
                </h3>

                <p className="mt-5 text-[15px] leading-7 text-white/68">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="inline-flex rounded-full border border-[#3657A8]/55 bg-[#172347] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F4F8FF]/88 shadow-[0_8px_26px_rgba(12,27,68,0.28)]">
              Dynamic context adjustment
            </p>

            <h2 className="mt-4 font-mono text-[32px] font-black uppercase leading-[0.94] tracking-[-0.065em] sm:text-[48px]">
              The room, your role, and the outcome change the support.
            </h2>

            <p className="mt-6 max-w-xl text-[16px] leading-8 text-white/68">
              Useful communication guidance cannot be generic. GEORGE adapts
              strategically to the role you occupy, the authority you have,
              the audience in front of you, and the result you are trying to
              achieve.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {contextCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[24px] border border-[#4E7CFF]/24 bg-[#4E7CFF]/[0.07] p-6"
              >
                <h3 className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#AFC1FF]">
                  {card.title}
                </h3>

                <p className="mt-4 text-[15px] leading-7 text-white/68">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full border border-[#3657A8]/55 bg-[#172347] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F4F8FF]/88 shadow-[0_8px_26px_rgba(12,27,68,0.28)]">
              Impact areas
            </p>

            <h2 className="mt-4 font-mono text-[32px] font-black uppercase leading-[0.94] tracking-[-0.065em] sm:text-[50px]">
              Built for people whose conversations have consequences.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {impactCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[26px] border border-white/10 bg-[#08090A] p-6"
              >
                <h3 className="font-mono text-[13px] uppercase tracking-[0.22em] text-white">
                  {card.title}
                </h3>

                <p className="mt-5 text-[15px] leading-7 text-white/68">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-[#3657A8]/55 bg-[#172347] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F4F8FF]/88 shadow-[0_8px_26px_rgba(12,27,68,0.28)]">
                Our technology
              </p>

              <h2 className="mt-4 font-mono text-[32px] font-black uppercase leading-[0.94] tracking-[-0.065em] sm:text-[50px]">
                Late help is not help.
              </h2>
            </div>

            <p className="text-[16px] leading-8 text-white/68">
              GEORGE is optimized for fast support because guidance that
              arrives after the moment has passed has little operational
              value. The infrastructure is designed to process live speech,
              reason quickly, and deliver usable support while the user can
              still affect the outcome.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {technologyCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[24px] border border-white/10 bg-white/[0.035] p-6"
              >
                <h3 className="font-mono text-[12px] uppercase tracking-[0.24em] text-white">
                  {card.title}
                </h3>

                <p className="mt-4 text-[15px] leading-7 text-white/66">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-5 py-8 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/34 sm:px-8">
        © 2026 BRANESx. All Rights Reserved.
      </footer>
    </main>
  )
}
