'use client'

import PageShell from '@/components/layout/PageShell'

const openingItems = [
  'clarity',
  'direction',
  'execution',
]

const designedToHelpItems = [
  'think clearly',
  'make decisions',
  'move forward',
]

const doesNotReplaceItems = [
  'professional advice',
  'independent judgment',
  'personal responsibility',
]

const useOfGeorgeItems = [
  'You are responsible for your decisions and actions',
  'GEORGE provides guidance, not commands',
  'You decide what to follow, ignore, or change',
  'Outcomes depend on what you do, not what is suggested',
]

const decisionContextItems = [
  'the information you provide',
  'the context available at the time',
]

const decisionContextMeaningItems = [
  'incomplete input can lead to incomplete guidance',
  'changing conditions may require different decisions',
  'you should reassess when new information appears',
]

const multipleGoalsItems = [
  'more than one objective',
  'parallel tracks of work',
  'shifting priorities',
]

const multipleGoalsAgreementItems = [
  'priorities are ultimately set by you',
  'tradeoffs still exist',
  'not all goals can move at the same speed',
]

const limitsItems = [
  'No guarantees of results',
  'No guarantee of accuracy in all situations',
  'The system may evolve, improve, or change over time',
  'Availability may vary',
]

const dataAndInputItems = [
  'Information may be used to improve system performance',
  'Your inputs are not made public unless you choose to share them',
  'You are responsible for what you submit',
]

const useBoundariesItems = [
  'for unlawful activity',
  'to generate harmful or deceptive outcomes',
  'in ways that bypass responsibility or accountability',
]

const systemEvolutionItems = [
  'changes to responses',
  'changes to behavior',
  'new capabilities over time',
]

const finalPositionItems = [
  'see clearly',
  'decide faster',
  'move with direction',
]

function BulletGroup({
  title,
  items,
}: {
  title?: string
  items: string[]
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
      {title && <p className="text-sm font-medium text-white">{title}</p>}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#7C8CFF]" />
            <p className="text-sm leading-7 text-neutral-400">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TOAPage() {
  return (
    <PageShell title="Terms of Access" eyebrow="Agreement" backToGeorge withSidebar={false}>
      <div className="max-w-5xl space-y-10">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Terms of Access
          </h2>

          <div className="mt-4 space-y-4 text-sm leading-7 text-neutral-400">
            <p>
              GEORGE is a system for clarity, direction, and execution.
            </p>

            <p>
              Use it to improve how you think and act—not to avoid
              responsibility for outcomes.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Opening</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <BulletGroup title="GEORGE is a system for" items={openingItems} />
            <BulletGroup title="It is designed to help you" items={designedToHelpItems} />
            <BulletGroup title="It does not replace" items={doesNotReplaceItems} />
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
              <p className="text-sm leading-7 text-neutral-400">
                Use it to improve how you think and act—not to avoid
                responsibility for outcomes.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Use of GEORGE</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <BulletGroup items={useOfGeorgeItems} />
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
              <p className="text-sm leading-7 text-neutral-400">
                GEORGE can support your thinking, direction, and execution—but
                it does not act for you.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Memory and Saved Content</h2>

          <div className="grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
              <p className="text-sm leading-7 text-neutral-400">
                GEORGE may allow you to save a response together with the user message immediately before it, organized into folders you choose or create.
              </p>

              <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                <li>• Saved content is stored locally in your environment</li>
                <li>• Saved content may include a shortened GEORGE preview for easier retrieval</li>
                <li>• Saved content reflects prior context and may become outdated</li>
                <li>• GEORGE does not automatically apply saved content to new interactions</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
              <p className="text-sm leading-7 text-neutral-400">
                You are responsible for how saved content is used and reintroduced.
              </p>

              <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                <li>• You choose what to save and where to place it</li>
                <li>• You choose when to reintroduce saved material</li>
                <li>• You must reassess its relevance to current conditions</li>
                <li>• Prior guidance may not apply to new situations</li>
              </ul>
            </div>

          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
            <p className="text-sm leading-7 text-neutral-400">
              Saved content is a reference tool. It does not replace current judgment, updated context, or decision-making responsibility.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Decision Context</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <BulletGroup title="GEORGE operates on" items={decisionContextItems} />
            <BulletGroup title="This means" items={decisionContextMeaningItems} />
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
            <p className="text-sm leading-7 text-neutral-400">
              Use GEORGE as a tool to improve decisions—not as a final authority.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Multiple Goals</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <BulletGroup title="GEORGE may help you manage" items={multipleGoalsItems} />
            <BulletGroup title="You agree that" items={multipleGoalsAgreementItems} />
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
            <p className="text-sm leading-7 text-neutral-400">
              GEORGE helps structure direction, but you determine focus.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Capacity and Billing</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
              <p className="text-sm leading-7 text-neutral-400">
                GEORGE operates with varying levels of capacity depending on your access level.
              </p>

              <p className="mt-3 text-sm leading-7 text-neutral-400">
                When capacity is limited, GEORGE may:
              </p>

              <ul className="mt-2 space-y-2 text-sm text-neutral-400">
                <li>• retain less context</li>
                <li>• provide shorter responses</li>
                <li>• reduce execution depth</li>
                <li>• limit access to certain tools</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
              <p className="text-sm leading-7 text-neutral-400">
                Full capacity restores continuity, deeper execution, and full system capability.
              </p>

              <p className="mt-3 text-sm leading-7 text-neutral-400">
                Full capacity is provided through a recurring subscription.
              </p>

              <p className="mt-2 text-sm leading-7 text-neutral-300">
                $9 per month, billed automatically until canceled.
              </p>

              <p className="mt-2 text-sm leading-7 text-neutral-400">
                You may cancel at any time. Access continues through the current billing period.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Limits</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <BulletGroup items={limitsItems} />
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
              <p className="text-sm leading-7 text-neutral-400">
                GEORGE is built to be useful—but not infallible.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Data and Input</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <BulletGroup items={dataAndInputItems} />
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
              <p className="text-sm leading-7 text-neutral-400">
                Do not submit sensitive or critical information unless you are
                comfortable doing so.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Use Boundaries</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <BulletGroup title="You agree not to use GEORGE" items={useBoundariesItems} />
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
              <p className="text-sm leading-7 text-neutral-400">
                GEORGE is intended to support productive and legitimate use.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">System Evolution</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <BulletGroup title="This includes" items={systemEvolutionItems} />
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
              <p className="text-sm leading-7 text-neutral-400">
                Use implies acceptance that the system is evolving.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <h2 className="text-xl font-semibold text-white">Final Position</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <BulletGroup title="GEORGE helps you" items={finalPositionItems} />

            <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
              <p className="text-sm leading-7 text-neutral-400">
                It can stay with you across decisions and execution.
              </p>

              <div className="space-y-2">
                <p className="text-sm leading-7 text-neutral-300">
                  But:
                </p>
                <p className="text-sm leading-7 text-neutral-400">
                  You are the one acting.
                </p>
                <p className="text-sm leading-7 text-neutral-400">
                  You are the one choosing.
                </p>
                <p className="text-sm leading-7 text-neutral-400">
                  You are the one responsible for outcomes.
                </p>
              </div>

              <p className="text-sm leading-7 text-neutral-300">
                Stay with it—and you can get something real done.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
