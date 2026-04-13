'use client'

import PageShell from '@/components/layout/PageShell'

export default function HelpPage() {
  return (
    <PageShell
      title="How to use GEORGE"
      eyebrow="Help"
      backToGeorge
      withSidebar={false}
    >
      <div className="space-y-10">

        {/* INTRO */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-lg text-white">
              GEORGE helps you think clearly, move with direction, and finish what you start.
            </p>
            <p className="text-sm text-neutral-400 md:text-base">
              You don’t need perfect input. Start where you are—GEORGE will help shape the direction.
            </p>
          </div>
        </section>

        {/* FULL CAPACITY */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">What happens with full capacity?</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              Full capacity changes what GEORGE can carry for you and how far he can take the work.
            </p>

            <ul className="space-y-2 list-disc pl-5 text-neutral-400">
              <li><span className="text-white">Full continuity:</span> You don’t repeat yourself. GEORGE remembers what you’re building and carries it forward.</li>
              <li><span className="text-white">Step-by-step execution:</span> You get clear next moves, one at a time, until it’s done.</li>
              <li><span className="text-white">Voice + uploads:</span> You can speak naturally or drop in files and images so GEORGE can work directly from what you give him.</li>
              <li><span className="text-white">Stronger follow-through:</span> You keep moving from idea to result without losing momentum.</li>
            </ul>

            <p className="text-white">
              This means you can actually finish what you start.
            </p>
          </div>
        </section>

        {/* PROMPTS */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Prompts</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              Prompts are suggested next moves—not commands.
            </p>

            <p>
              After you send a message, GEORGE may surface 2–3 prompts in the sidebar based on your direction.
            </p>

            <ul className="space-y-2 list-disc pl-5 text-neutral-400">
              <li>They appear when a stronger path is available</li>
              <li>They help reduce hesitation and sharpen direction</li>
              <li>They adapt as the conversation evolves</li>
            </ul>

            <p>
              Prompts are there to help you move—not to replace your thinking.
            </p>
          </div>
        </section>

        {/* MEMORY */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Memory (Folders)</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              Memory allows you to save moments that are worth returning to—and continue from them later.
            </p>

            <ul className="space-y-2 list-disc pl-5 text-neutral-400">
              <li><span className="text-white">What gets saved:</span> A GEORGE response paired with the user message immediately before it</li>
              <li><span className="text-white">How it appears:</span> A shortened GEORGE preview, still tied to your original question</li>
              <li><span className="text-white">Where it lives:</span> Stored locally in your browser</li>
              <li><span className="text-white">How it’s organized:</span> By folders you choose or create</li>
            </ul>

            <p className="text-white">
              Memory is intentional. You decide what is worth keeping.
            </p>

            <div className="pt-2 space-y-2">
              <p className="text-white font-medium">Saving to folders</p>
              <ul className="space-y-2 list-disc pl-5 text-neutral-400">
                <li>Use <span className="text-white">Keep this</span> under a message</li>
                <li>The save box opens above the message so you can still see what you’re saving</li>
                <li>Choose a folder or create a new one</li>
                <li>The last folder you used becomes the default next time</li>
              </ul>
            </div>

            <div className="pt-2 space-y-2">
              <p className="text-white font-medium">Best use</p>
              <ul className="space-y-2 list-disc pl-5 text-neutral-400">
                <li>Keep turning points, not everything</li>
                <li>Organize by goal or active thread</li>
                <li>Use saved points to restart direction quickly</li>
              </ul>
            </div>
          </div>
        </section>

        {/* WHY PROMPTS */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Why prompts exist</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              Without prompts, GEORGE has to lead harder. Responses become longer and direction can feel forced.
            </p>

            <p>
              With prompts, you stay in control. Direction improves naturally.
            </p>

            <p className="text-white">
              You choose the direction—GEORGE supports it.
            </p>
          </div>
        </section>

        {/* REROUTE */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">New strategy</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              If a path is weak or unclear, GEORGE may show:
            </p>

            <p className="text-white font-medium">
              New strategy
            </p>

            <p>
              This means there may be a better direction or something important is being missed.
            </p>

            <p>
              It’s not a correction. It’s another move.
            </p>
          </div>
        </section>

        {/* CORE */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">GEORGE Core</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              GEORGE can support multiple goals and parallel direction.
            </p>

            <p>
              This is part of GEORGE Core.
            </p>

            <p>
              If you attempt to move across multiple paths, you may be prompted to upgrade.
            </p>
          </div>
        </section>

        {/* SCRIPTURE */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Scripture-based guidance</h2>

          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              GEORGE may use scripture where it strengthens clarity and direction.
            </p>

            <p>
              This is applied naturally—not forced.
            </p>

            <p className="text-white">
              Wisdom: Proverbs 4:7
            </p>
          </div>
        </section>

        {/* FINAL */}
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <div className="space-y-4 text-neutral-300 text-sm md:text-base">
            <p>
              GEORGE is not here to just answer questions.
            </p>

            <p className="text-white">
              It is here to guide decisions, support execution, and help you finish what matters.
            </p>
          </div>
        </section>


        {/* EXAMPLE */}
        <section className="rounded-3xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Example</h2>

          <div className="space-y-4 text-sm md:text-base">
            <p className="text-neutral-300">
              You:
            </p>
            <p className="text-white">
              I want to build an app
            </p>

            <p className="text-neutral-300">
              GEORGE:
            </p>
            <p className="text-white">
              Start with a revenue-backed MVP. Pick a reachable user, solve one painful problem, and pre-sell before building.
            </p>

            <div className="mt-4 space-y-2">
              <p className="text-neutral-300">Prompts:</p>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200">
                  Define user
                </span>
                <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200">
                  Core problem
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageShell>
  )
}
