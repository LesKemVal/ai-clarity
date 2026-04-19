'use client'

import PageShell from '@/components/layout/PageShell'

export default function HelpPage() {
  return (
    <PageShell
      title="Ways to use GEORGE"
      eyebrow="Help"
      backToGeorge
    >
      <div className="space-y-10">

        {/* INTRO */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-lg text-white">
              GEORGE is about action. It helps you think better, move faster, and follow through.
            </p>
            <p className="text-sm text-neutral-400 md:text-base">
              You do not need perfect input. Start where you are. GEORGE will help sharpen what matters next.
            </p>
          </div>
        </section>

        {/* FULL CAPACITY */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">What is GEORGE?</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              GEORGE is built for people who want clarity that actually helps.
            </p>

            <ul className="space-y-2 list-disc pl-5 text-neutral-400">
              <li><span className="text-white">Full continuity:</span> You don’t repeat yourself. GEORGE remembers what you’re building and carries it forward.</li>
              <li><span className="text-white">Step-by-step execution:</span> You get clear next moves, one at a time, until it’s done.</li>
              <li><span className="text-white">Voice + uploads:</span> You can speak naturally or drop in files and images so GEORGE can work directly from what you give him.</li>
              <li><span className="text-white">Stronger follow-through:</span> You keep moving from idea to result without losing momentum.</li>
            </ul>

            <p className="text-white">
              GEORGE is not here to decorate your screen. GEORGE is here to help you get something real done.
            </p>
          </div>
        </section>

        {/* PROMPTS */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Who is it for?</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              People under pressure. Builders. Students. Entrepreneurs. Anyone who needs clarity before the moment gets expensive.
            </p>

            <p>
              GEORGE works best when something matters and you do not want to keep drifting.
            </p>

            <ul className="space-y-2 list-disc pl-5 text-neutral-400">
              <li>They appear when a stronger path is available</li>
              <li>They help reduce hesitation and sharpen decisions</li>
              <li>They adapt as the conversation evolves</li>
            </ul>

            <p>
              Results improve when clarity improves.
            </p>
          </div>
        </section>

        {/* MEMORY */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">How to use GEORGE</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              Start simple. Tell GEORGE what you are trying to do, where you are stuck, or what decision you need to make.
            </p>

            <ul className="space-y-2 list-disc pl-5 text-neutral-400">
              <li><span className="text-white">What gets saved:</span> A GEORGE response paired with the user message immediately before it</li>
              <li><span className="text-white">How it appears:</span> A shortened GEORGE preview, still tied to your original question</li>
              <li><span className="text-white">Where it lives:</span> Stored locally in your browser</li>
              <li><span className="text-white">How it’s organized:</span> By folders you choose or create</li>
            </ul>

            <p className="text-white">
              Best prompts:
            </p>

            <div className="pt-2 space-y-2">
              <p className="text-white font-medium">Help me get unstuck.</p>
              <ul className="space-y-2 list-disc pl-5 text-neutral-400">
                <li>Use <span className="text-white">Keep this</span> under a message</li>
                <li>The save box opens above the message so you can still see what you’re saving</li>
                <li>Choose a folder or create a new one</li>
                <li>The last folder you used becomes the default next time</li>
              </ul>
            </div>

            <div className="pt-2 space-y-2">
              <p className="text-white font-medium">Build me a path to ______.</p>
              <ul className="space-y-2 list-disc pl-5 text-neutral-400">
                <li>Keep turning points, not everything</li>
                <li>Organize by goal or active thread</li>
                <li>Use saved points to restart momentum quickly</li>
              </ul>
            </div>
          </div>
        </section>

        {/* WHY PROMPTS */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">What am I missing here?</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              Help me focus.
            </p>

            <p>
              Give me 3 realistic options.
            </p>

            <p className="text-white">
              Train me for ______.
            </p>
          </div>
        </section>

        {/* REROUTE */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Help me think clearly.</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              What tier should I use?
            </p>

            <p className="text-white font-medium">
              New strategy
            </p>

            <p>
              SMART: Try it now.
            </p>

            <p>
              INTELLIGENT: If you use GEORGE often.
            </p>
          </div>
        </section>

        {/* CORE */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">BRILLIANT: If results matter.</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              Practical note
            </p>

            <p>
              GEORGE helps with judgment and execution.
            </p>

            <p>
              GEORGE is not a lawyer, doctor, therapist, or broker.
            </p>
          </div>
        </section>

        {/* SCRIPTURE */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Start now</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              Enter GEORGE
            </p>

            <p>
              Upgrade to Intelligent
            </p>

            <p className="text-white">
              Bring GEORGE with you
            </p>
          </div>
        </section>

        {/* FINAL */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              GEORGE is not here just to answer questions.
            </p>

            <p className="text-white">
              GEORGE is here to guide decisions, support execution, and help you finish what matters.
            </p>
          </div>
        </section>


        

      </div>
    </PageShell>
  )
}
