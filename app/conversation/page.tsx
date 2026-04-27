'use client'

import PageShell from '@/components/layout/PageShell'

export default function ConversationPage() {
  return (
    <PageShell
      title="Conversation Engine"
      eyebrow="GEORGE"
      backToGeorge
    >
      <div className="space-y-8">

        <section className="rounded-3xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/8 p-6 md:p-8">
          <div className="space-y-4">
            <p className="text-2xl font-semibold text-white">
              Words matter when the moment is live.
            </p>
            <p className="leading-7 text-neutral-200">
              GEORGE helps you think, respond, hold leverage, and move outcomes in real time.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="/george"
                className="rounded-full bg-[#7C8CFF] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Use GEORGE Defaults
              </a>
              <a
                href="/george"
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#7C8CFF]/45"
              >
                Build Custom Setup
              </a>
            </div>

            <p className="text-sm leading-6 text-neutral-400">
              If you are not ready to answer every setup question, GEORGE will use best-practice defaults and help you refine as you go.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Conversation Assistance
          </h2>

          <div className="space-y-3 text-neutral-300">
            <p>Built for individuals.</p>

            <ul className="list-disc pl-5 space-y-2 text-neutral-400">
              <li>Exact lines</li>
              <li>Short cues</li>
              <li>Pressure support</li>
              <li>Difficult conversations</li>
              <li>Negotiations</li>
              <li>Interviews</li>
            </ul>

            <a
              href="/top-up?intent=conversation"
              className="inline-flex rounded-full bg-[#7C8CFF] px-5 py-3 text-sm font-semibold text-black"
            >
              Activate Conversation Engine
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-[#22c55e]/30 bg-[#22c55e]/10 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Pro Conversation Partner
          </h2>

          <div className="space-y-3 text-neutral-200">
            <p>Built for reps, callers, teams, and firms.</p>

            <ul className="list-disc pl-5 space-y-2 text-neutral-300">
              <li>Scripts</li>
              <li>Guardrails</li>
              <li>Callbacks</li>
              <li>Objection handling</li>
              <li>Repeatable winning lines</li>
              <li>Campaign discipline</li>
            </ul>

            <a
              href="/top-up?intent=pro"
              className="inline-flex rounded-full border border-[#22c55e]/40 bg-[#22c55e]/20 px-5 py-3 text-sm font-semibold text-white"
            >
              Activate Pro Conversation Partner
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Return Fast
          </h2>

          <div className="space-y-2 text-neutral-300">
            <p>Open GEORGE.</p>
            <p>Choose campaign or script.</p>
            <p>Tap LIVE.</p>
            <p>GEORGE resumes instantly.</p>
          </div>
        </section>

      </div>
    </PageShell>
  )
}
