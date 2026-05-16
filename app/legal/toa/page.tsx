'use client'

import PageShell from '@/components/layout/PageShell'

const sections = [
  {
    title: 'Acceptance',
    body: 'By accessing BRANESx / GEORGE, you agree to these Terms of Access and to the operating boundaries of the service.',
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
    body: 'Subscriptions may renew automatically until canceled under the billing terms presented at checkout. You are responsible for reviewing plan terms before purchase.',
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
    body: 'Features, pricing, models, and availability may change at any time. Continued use of the service means you accept those changes.',
  },
  {
    title: 'Limitation of liability',
    body: 'Use GEORGE at your own discretion. To the maximum extent allowed by law, BRANESx is not liable for indirect or consequential losses.',
  },
  {
    title: 'Termination',
    body: 'Access may be suspended, limited, or terminated for abuse, misuse, policy violations, payment issues, or conduct that creates risk to the platform or other users.',
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
        <section className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5 shadow-none backdrop-blur md:p-8">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Terms of Access
            </h1>

            <p className="text-sm leading-7 text-neutral-300 md:text-base">
              GEORGE is built to help people think clearly, decide faster, and move with direction.
            </p>

            <p className="text-sm leading-7 text-neutral-400 md:text-base">
              These terms define the boundaries of access, the limits of the service, and your responsibility while using BRANESx / GEORGE.
            </p>
          </div>
        </section>

        <section className="grid gap-4">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5 shadow-none backdrop-blur md:p-8"
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
                      className="rounded-[1rem] border border-white/[0.045] bg-black/25 px-4 py-3 text-sm text-neutral-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="rounded-[1rem] border border-white/[0.06] bg-white/[0.018] p-5 shadow-none backdrop-blur md:p-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-medium text-white md:text-base">
              Final position
            </p>

            <p className="text-sm leading-7 text-neutral-200 md:text-base">
              GEORGE may assist with clarity, planning, and execution support.
            </p>

            <p className="text-sm leading-7 text-neutral-300 md:text-base">
              But authority remains with the user. You are responsible for your choices, your conduct, your filings, your purchases, and the consequences that follow.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
