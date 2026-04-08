import Brand from '@/components/Brand'
import Link from 'next/link'

function IconCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-[#080808] p-6">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
        {children}
      </div>
      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-100">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-neutral-400">
        {description}
      </p>
    </div>
  )
}

function DotIcon() {
  return <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
}

function StripeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M13.479 9.883c-2.234-.528-2.75-.883-2.75-1.58 0-.576.53-.947 1.498-.947 1.381 0 3.125.49 4.506 1.238V4.55A10.63 10.63 0 0 0 12.5 3.7c-3.306 0-5.597 1.73-5.597 4.59 0 3.56 2.94 4.39 5.128 4.92 2.112.508 2.58.884 2.58 1.654 0 .698-.618 1.109-1.76 1.109-1.51 0-3.432-.617-4.941-1.454v4.096c1.693.733 3.392 1.05 5.197 1.05 3.39 0 5.86-1.682 5.86-4.649 0-3.83-3.165-4.537-5.488-5.133Z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6l-7-3Z" />
    </svg>
  )
}

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 4a3 3 0 0 0-3 3v1a2.5 2.5 0 0 0-2 2.45A2.5 2.5 0 0 0 6 12.9V14a3 3 0 0 0 3 3m0-13a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3m3-16a3 3 0 0 1 3 3v1a2.5 2.5 0 0 1 2 2.45 2.5 2.5 0 0 1-2 2.45V14a3 3 0 0 1-3 3" />
    </svg>
  )
}

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-neutral-100">
      <Brand />

      <div className="mx-auto max-w-6xl px-6 py-10 pt-20 md:px-8 lg:px-10">
        <header className="mb-12 border-b border-amber-400/20 pb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-amber-300/80">
            WHAT’S TO COME
          </p>

          <h1 className="mt-4 max-w-5xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            A declaration of where you and GEORGE are headed.
          </h1>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-neutral-300">
            GEORGE is being built to become more useful with time, more aware of the user,
            more capable in execution, and more distinguishable from one version to the next.
            The goal is not just better answers. The goal is better outcomes.
          </p>

          <p className="mt-4 max-w-4xl text-base leading-8 text-neutral-400">
            As GEORGE gets stronger, users should be able to do more with less confusion:
            protect time, handle communication, think through decisions, stay aligned with
            long-term goals, recover momentum faster, and build toward work, family, health,
            business, discipline, and legacy with more clarity. Information saves lives.
            Structured guidance changes outcomes.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {['STRIPE', 'MAIL', 'CALENDAR', 'VOICE', 'MEMORY', 'MORE...'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-amber-400/30 px-3 py-1 text-xs uppercase tracking-[0.22em] text-amber-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <section className="mb-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-neutral-800 bg-[#080808] p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              WHY THIS MATTERS
            </p>

            <div className="mt-5 space-y-4 text-neutral-300 leading-8">
              <p>
                This is about more than convenience. Better timing, clearer decisions, stronger
                structure, and less drift can materially improve a person’s life and work.
              </p>
              <p>
                We want to build BRANES in a way that allows GEORGE to reach the people and
                communities that need strong information and structured guidance the most—rural
                and urban, overlooked and underserved.
              </p>
              <p>
                Early subscribers help us build something that can be valuable right now and do a lot
                of good over time. The humanitarian angle matters. But the product still has to
                stand on its own. It has to be worth the money because it improves outcomes.
              </p>
              <p>
                The system is also built on fixed principles. GEORGE is designed to never contradict
                the KJV of the Holy Bible. That foundation is not presented as force—it is structure.
                It is meant to provide consistency, moral clarity, and a stable reference point as
                the system grows more capable.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-amber-400/20 bg-amber-400/5 p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">
              SUPPORT NOW
            </p>

            <div className="mt-5 space-y-4 text-neutral-200 leading-8">
              <p>
                The people who support BRANES early are helping shape what GEORGE becomes.
              </p>
              <p>
                They are helping us build a platform that gets sharper, more useful, and more
                available over time.
              </p>
              <p>
                Information saves lives. Better structure changes outcomes.
              </p>
            </div>
          </div>
        </section>

        {/* rest unchanged */}
      </div>
    </main>
  )
}
