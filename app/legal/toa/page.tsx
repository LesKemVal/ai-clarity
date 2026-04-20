'use client'

import PageShell from '@/components/layout/PageShell'

const sections = [
  {
    title: 'Acceptance',
    body: 'By accessing BRANESx / GEORGE, you agree to these Terms of Access.',
  },
  {
    title: 'No guaranteed outcomes',
    body: 'GEORGE may assist with strategy, organization, judgment, and execution support, but no result is guaranteed.',
  },
  {
    title: 'User responsibility',
    body: 'You remain responsible for your decisions, actions, purchases, filings, health choices, legal actions, and financial decisions.',
  },
  {
    title: 'Not professional advice',
    body: 'GEORGE is not legal, medical, tax, investment, psychological, or emergency advice.',
  },
  {
    title: 'Payments',
    body: 'Subscriptions may renew automatically unless canceled according to billing terms.',
  },
  {
    title: 'Acceptable use',
    bullets: [
      'fraud',
      'harassment',
      'illegal conduct',
      'abuse',
      'rights violations',
      'system attacks',
    ],
  },
  {
    title: 'Service changes',
    body: 'Features, pricing, and availability may change.',
  },
  {
    title: 'Limitation of liability',
    body: 'Use GEORGE at your own discretion. To the maximum extent allowed by law, BRANESx is not liable for indirect or consequential losses.',
  },
  {
    title: 'Termination',
    body: 'Access may be suspended or terminated for abuse, misuse, or violations of these terms.',
  },
  {
    title: 'Contact',
    body: 'Use the /contact page for questions related to access or terms.',
  },
]

export default function TOAPage() {
  return (
    <PageShell title="Terms of Access" eyebrow="Agreement" backToGeorge withSidebar={false}>
      <div className="max-w-4xl space-y-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Terms of Access
            </h1>

            <p className="text-sm leading-7 text-neutral-300 md:text-base">
              GEORGE is built to help people think clearly, decide faster, and move with direction.
            </p>

            <p className="text-sm leading-7 text-neutral-400 md:text-base">
              These terms explain the boundaries of access and your responsibility while using BRANESx / GEORGE.
            </p>
          </div>
        </section>

        <section className="grid gap-4">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur md:p-8"
            >
              <h2 className="text-xl font-semibold text-white">
                {section.title}
              </h2>

              {'body' in section && section.body && (
                <p className="mt-3 text-sm leading-7 text-neutral-400 md:text-base">
                  {section.body}
                </p>
              )}

              {'bullets' in section && section.bullets && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {section.bullets.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-neutral-800 bg-black/25 px-4 py-3 text-sm text-neutral-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-medium text-white md:text-base">
              Final position
            </p>

            <p className="text-sm leading-7 text-neutral-200 md:text-base">
              GEORGE can support your thinking and execution.
            </p>

            <p className="text-sm leading-7 text-neutral-300 md:text-base">
              But you are the one acting, choosing, and remaining responsible for outcomes.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
