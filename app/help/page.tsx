'use client'

import PageShell from '@/components/layout/PageShell'

export default function HelpPage() {
  return (
    <PageShell
      title="How to use GEORGE"
      eyebrow="Help"
      backToGeorge
    >
      <div className="space-y-8">

        <section className="rounded-3xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/8 p-6 md:p-8">
          <p className="text-white text-sm leading-7">
            GEORGE operates within principles that respect the Holy Bible (KJV) and will not contradict it.
          </p>
          <p className="text-neutral-400 mt-2 text-sm leading-7">
            You choose the direction. GEORGE helps you think clearly, move deliberately, and respond better when the moment matters.
          </p>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <p className="text-xl font-semibold text-white">
            GEORGE is a clarity and execution system.
          </p>
          <p className="text-neutral-400 leading-7 mt-2">
            In normal mode, GEORGE helps you think. In LIVE mode, GEORGE helps you perform. Same system — tighter when the pressure rises.
          </p>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">The Operating Model</h2>
          <ul className="list-disc space-y-2 pl-5 text-neutral-400">
            <li>Direction — identify what actually matters</li>
            <li>Action — choose the next useful move</li>
            <li>Signal — learn from what happens next</li>
          </ul>
          <p className="text-white mt-3">You bring the objective. GEORGE narrows the path.</p>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">How to Start</h2>
          <p className="text-neutral-300">Tell GEORGE what you want to happen.</p>
          <ul className="list-disc space-y-2 pl-5 text-neutral-400">
            <li>“I need to make a decision.”</li>
            <li>“I need to say this the right way.”</li>
            <li>“I need a plan I can actually follow.”</li>
            <li>“I’m stuck. Find the next move.”</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/8 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">LIVE Mode</h2>

          <div className="space-y-4 text-neutral-300">
            <p className="text-white font-medium">Just talk.</p>
            <p className="text-neutral-400">LIVE GEORGE listens for pressure, confusion, timing, and opportunity. You do not need to explain everything first.</p>

            <p className="text-white font-medium">Cues</p>
            <p className="text-neutral-400">GEORGE gives short next-move guidance when the moment is moving fast.</p>

            <p className="text-white font-medium">Lines</p>
            <p className="text-neutral-400">When words matter, GEORGE can give you something usable to say next.</p>

            <p className="text-white font-medium">Control</p>
            <p className="text-neutral-400">When the room shifts, GEORGE helps you recover without rambling, freezing, or chasing the wrong issue.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Use the Buttons as Next Moves</h2>
          <ul className="list-disc space-y-2 pl-5 text-neutral-400">
            <li>Keep this — save something worth returning to</li>
            <li>Send — move the response where it needs to go</li>
            <li>Clarify — sharpen the signal without losing intent</li>
            <li>Reword — reshape the line for the moment you are in</li>
            <li>LIVE — enter real-time support</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Professional Mode</h2>
          <p className="text-neutral-300">
            Professional Mode is for conversations tied to results: calls, appointments, donations, sales, consulting, outreach, recruiting, or any situation where words create measurable outcomes.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-neutral-400">
            <li>Load a campaign</li>
            <li>Use scripts, cues, and repeatable lines</li>
            <li>Track wins, losses, objections, and follow-ups</li>
            <li>Reduce weak repetition across reps or attempts</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Tiers</h2>
          <ul className="list-disc space-y-2 pl-5 text-neutral-400">
            <li>Smart → direction and big-picture clarity</li>
            <li>Intelligent → deeper structure, continuity, and progress</li>
            <li>Brilliant → LIVE support and real-time conversation advantage</li>
            <li>Pro → campaign discipline and measurable performance improvement</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-[#11131A]/72 p-6 md:p-8">
          <p className="text-white text-lg font-medium">
            The simple rule: in normal mode, give GEORGE the objective. In LIVE mode, just talk.
          </p>
        </section>

      </div>
    </PageShell>
  )
}
