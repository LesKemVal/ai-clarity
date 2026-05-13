'use client'

import PageShell from '@/components/layout/PageShell'

export default function HelpPage() {
  return (
    <PageShell
      title="How to use GEORGE"
      eyebrow="Help"
      backToGeorge
    >
      <div className="space-y-7">

        <section className="rounded-2xl border border-[#7C8CFF]/25 bg-[#7C8CFF]/[0.06] p-6 md:p-8">
          <p className="text-sm leading-7 text-white">
            GEORGE operates within principles that respect the Holy Bible (KJV) and will not contradict it.
          </p>
          <p className="mt-3 text-sm leading-7 text-neutral-400">
            You choose the direction. GEORGE helps you think clearly, move deliberately, and respond better when the moment matters.
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <p className="text-xl font-semibold tracking-[-0.03em] text-white">
            GEORGE is built for clarity, execution, and continuity.
          </p>
          <p className="mt-3 leading-7 text-neutral-400">
            Normal GEORGE helps you think through the situation. LIVE helps you carry that clarity into real conversations when timing, pressure, or hesitation matters.
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">The Operating Model</h2>
          <ul className="list-disc space-y-2 pl-5 text-neutral-400">
            <li>Direction — identify what actually matters.</li>
            <li>Action — choose the next useful move.</li>
            <li>Signal — learn from what happens next.</li>
          </ul>
          <p className="mt-4 text-neutral-300">
            You bring the objective. GEORGE narrows the path.
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">How to Start</h2>
          <p className="leading-7 text-neutral-300">
            Give GEORGE the real situation, not a perfect prompt.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-neutral-400">
            <li>“I need to make a decision.”</li>
            <li>“I need to say this the right way.”</li>
            <li>“I need a plan I can actually follow.”</li>
            <li>“I’m stuck. Find the next move.”</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-[#7C8CFF]/25 bg-[#7C8CFF]/[0.06] p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">LIVE Mode</h2>

          <div className="space-y-5">
            <div>
              <p className="font-medium text-white">Carry GEORGE into the room.</p>
              <p className="mt-2 leading-7 text-neutral-400">
                LIVE is for interviews, negotiations, boardrooms, presentations, difficult conversations, and pressure moments where words and timing matter.
              </p>
            </div>

            <div>
              <p className="font-medium text-white">Get short cues and repeatable lines.</p>
              <p className="mt-2 leading-7 text-neutral-400">
                GEORGE can help you frame what to say next, recover when the room shifts, and stay composed without turning the moment into a lecture.
              </p>
            </div>

            <div>
              <p className="font-medium text-white">Use continuity when the situation already has context.</p>
              <p className="mt-2 leading-7 text-neutral-400">
                If you have been using GEORGE to prepare for a business, interview, negotiation, relationship issue, or personal objective, LIVE can help you carry that context into the conversation.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Use the Controls as Next Moves</h2>
          <ul className="list-disc space-y-2 pl-5 text-neutral-400">
            <li>Keep this — save something worth returning to.</li>
            <li>Share — move useful guidance outside GEORGE.</li>
            <li>Related — surface nearby context.</li>
            <li>Simplify — reduce the answer to what matters most.</li>
            <li>Reword — reshape a line for the moment you are in.</li>
            <li>LIVE — enter real-time conversation support when access is active.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Continuity</h2>
          <p className="leading-7 text-neutral-400">
            Continuity lets GEORGE restore your tier, remember the active direction, and reduce repeated setup. Anonymous use is available for simple direction. Subscriber continuity is for restored access, stronger runtime context, and LIVE support.
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Tiers</h2>
          <ul className="list-disc space-y-2 pl-5 text-neutral-400">
            <li>Smart — clarity and directional reasoning.</li>
            <li>Intelligent — stronger continuity and execution support.</li>
            <li>Brilliant — LIVE assistance and the strongest runtime continuity.</li>
            <li>Brilliant Day — temporary LIVE runtime elevation.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <p className="text-lg font-medium leading-8 text-white">
            The simple rule: use normal GEORGE when you need direction. Use continuity when you want GEORGE to remember, restore, and support the situation as it develops.
          </p>
        </section>

      </div>
    </PageShell>
  )
}
