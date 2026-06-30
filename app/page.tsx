'use client'

import { HomeHeroSequence } from '@/components/home/HomeHeroSequence'

const impactCards = [
  {
    title: 'Low-income and under-served communities',
    body: 'A person should not lose a job, contract, loan, or opportunity because they did not grow up around corporate language, investor language, banking language, or interview coaching. GEORGE helps people structure answers, catch pressure, respond clearly, and stay in the conversation when one conversation can change the path forward.',
  },
  {
    title: 'People with speaking disabilities',
    body: 'Some people know exactly what they mean but need more time, pacing support, word support, or structure under pressure. GEORGE can help turn intention into clear language without taking control away from the person speaking.',
  },
  {
    title: 'Neurodivergent professionals',
    body: 'ADHD, autism, anxiety, processing differences, and social pressure can make high-stakes conversations harder than the work itself. GEORGE helps with pacing, pauses, structure, recovery, and signals that may otherwise be missed.',
  },
]

const scenarioCards = [
  {
    title: 'Young Black and Hispanic founders',
    body: 'GEORGE can help founders handle skeptical investor questions, translate VC language, protect confidence, and pivot risk-heavy questioning back toward traction, growth, proof, and market opportunity.',
  },
  {
    title: 'Main Street entrepreneurs',
    body: 'A contractor, agency owner, salon operator, logistics company, or local business may be strong at the work but unfamiliar with banking, procurement, RFP panels, or corporate buying language. GEORGE helps them speak the language of the room.',
  },
  {
    title: 'Professionals and executives',
    body: 'Interviews, boardrooms, reviews, negotiations, sales calls, and internal meetings reward clarity under pressure. GEORGE helps users respond, pause, reframe, and protect the desired outcome while the conversation is still alive.',
  },
]

const supportModes = [
  ['Cue', 'Short signal. Minimum words. Useful when a small nudge is enough.'],
  ['Continuation', 'You start the thought. GEORGE helps finish it cleanly.'],
  ['Response', 'A complete line you can repeat, revise, shorten, or ignore.'],
  ['Advice', 'A practical next move when the room needs judgment, not a script.'],
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <HomeHeroSequence />

      <section className="border-t border-white/10 bg-[#050607] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#E7C47D]/70">LIVE Support</p>
              <h1 className="mt-4 max-w-3xl font-serif text-[44px] leading-[0.95] tracking-[-0.06em] sm:text-[68px]">
                Help while the conversation is happening.
              </h1>
            </div>

            <div className="space-y-5 text-[16px] leading-8 text-white/72">
              <p>
                GEORGE does not wait until the meeting, interview, pitch, or negotiation is over. GEORGE listens in real time, recognizes useful signals, and gives you a cue, line, continuation, or response while the outcome can still change.
              </p>
              <p>
                Forty-one cents of LIVE support in the right conversation could help someone get hired, close a deal, secure funding, win a contract, avoid a bad concession, or say the sentence they needed before the moment passed.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {supportModes.map(([title, body]) => (
              <div key={title} className="rounded-[22px] border border-white/10 bg-white/[0.035] p-5">
                <h3 className="font-mono text-[12px] uppercase tracking-[0.24em] text-white/88">{title}</h3>
                <p className="mt-4 text-[14px] leading-6 text-white/62">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#E7C47D]/70">Point blank</p>
            <h2 className="mt-4 font-serif text-[38px] leading-[1] tracking-[-0.05em] sm:text-[58px]">
              GEORGE helps people communicate when communication decides the opportunity.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {impactCards.map((card) => (
              <article key={card.title} className="rounded-[26px] border border-white/10 bg-[#08090A] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <h3 className="font-mono text-[13px] uppercase tracking-[0.22em] text-white">{card.title}</h3>
                <p className="mt-5 text-[15px] leading-7 text-white/68">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#060708] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#E7C47D]/70">Briefing matters</p>
            <h2 className="mt-4 font-serif text-[38px] leading-[1] tracking-[-0.05em] sm:text-[56px]">
              The room, your role, and the outcome change the support.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-6">
              <h3 className="font-mono text-[12px] uppercase tracking-[0.24em] text-white">Role</h3>
              <p className="mt-4 text-[15px] leading-7 text-white/66">
                Founder, candidate, executive, salesperson, parent, patient, negotiator, board member, or contractor. Your role tells GEORGE what authority you have and what support should sound like.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-6">
              <h3 className="font-mono text-[12px] uppercase tracking-[0.24em] text-white">Briefing</h3>
              <p className="mt-4 text-[15px] leading-7 text-white/66">
                Desired outcome, acceptable outcome, audience, pressure, risks, documents, and constraints. Better briefing means sharper support when the conversation gets real.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#E7C47D]/70">Where it can matter</p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {scenarioCards.map((card) => (
              <article key={card.title} className="rounded-[26px] border border-white/10 bg-[#070809] p-6">
                <h3 className="font-mono text-[13px] uppercase tracking-[0.22em] text-white">{card.title}</h3>
                <p className="mt-5 text-[15px] leading-7 text-white/68">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#050607] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#E7C47D]/70">Technology</p>
            <h2 className="mt-4 font-serif text-[38px] leading-[1] tracking-[-0.05em] sm:text-[56px]">
              Built for speed because late help is not help.
            </h2>
          </div>

          <div className="space-y-5 text-[15px] leading-7 text-white/68">
            <p>
              GEORGE uses OpenAI reasoning, Groq low-latency inference, Deepgram real-time speech recognition, Cartesia voice, Next.js, React, and TypeScript. The point is not to name-drop software. The point is speed, reliability, and support that arrives while the user can still use it.
            </p>
            <p>
              The future is wearable: discreet audio, readable glasses, live briefing, document-aware support, scenario-specific preparation, and enterprise tools that help people perform in rooms where the stakes are high.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
