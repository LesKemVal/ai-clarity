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

        <section className="rounded-[1rem] border border-[#7C8CFF]/30 bg-[#7C8CFF]/8 p-5 md:p-5">
          <div className="space-y-4">
            <p className="text-2xl font-semibold text-white">
              Stay composed while the moment is happening.
            </p>
            <p className="leading-7 text-neutral-200">
              GEORGE helps you respond clearly, protect leverage, and stay operational under pressure.
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

        <section className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5 md:p-5">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Conversation Assistance
          </h2>

          <div className="space-y-3 text-neutral-300">
            <p>For individuals navigating real conversations.</p>

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
              Continue to Brilliant
            </a>
          </div>
        </section>

        <section className="rounded-[1rem] border border-[#22c55e]/30 bg-[#22c55e]/10 p-5 md:p-5">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Pro Conversation Partner
          </h2>

          <div className="space-y-3 text-neutral-200">
            <p>Structured professional workflows are coming online progressively.</p>

            <ul className="list-disc pl-5 space-y-2 text-neutral-300">
              <li>Campaign continuity</li>
              <li>Structured LIVE assistance</li>
              <li>Conversation recovery</li>
              <li>Pressure-aware response support</li>
              <li>Operational continuity</li>
              <li>Professional runtime direction</li>
            </ul>

            <a
              href="/top-up?intent=pro"
              className="inline-flex rounded-full border border-[#22c55e]/40 bg-[#22c55e]/20 px-5 py-3 text-sm font-semibold text-white"
            >
              View Pro Direction
            </a>
          </div>
        </section>

        <section className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5 md:p-5">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Change GEORGE Mid-Conversation
          </h2>

          <div className="space-y-2 text-neutral-300">
            <p>Start with repeatable lines.</p>
            <p>Switch to short cues.</p>
            <p>Move into negotiation mode.</p>
            <p>Turn audio on or off.</p>
            <p>When subscriber continuity is active, GEORGE can keep the conversation state, script direction, and guardrails available while changing how it helps.</p>
          </div>
        </section>

        <section className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5 md:p-5">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Return Fast
          </h2>

          <div className="space-y-2 text-neutral-300">
            <p>Open GEORGE.</p>
            <p>Return through subscriber continuity.</p>
            <p>Tap LIVE.</p>
            <p>With subscriber continuity active, GEORGE can restore the last saved conversation state.</p>
          </div>
        </section>

      </div>
    </PageShell>
  )
}
