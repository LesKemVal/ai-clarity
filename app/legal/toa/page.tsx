'use client'

import PageShell from '@/components/layout/PageShell'

const sections = [
  {
    title: 'Acceptance',
    body: 'By accessing BRANESx / GEORGE, you agree to these Terms of Access and to the operating boundaries of the service.',
  },
  {
    title: 'No Guaranteed Outcomes',
    body: 'GEORGE may assist with strategy, organization, judgment, preparation, communication, and execution support, but no result is guaranteed.',
  },
  {
    title: 'User Responsibility',
    body: 'You remain responsible for your decisions, actions, purchases, filings, health choices, legal actions, financial decisions, and conduct.',
  },
  {
    title: 'Not Professional Advice',
    body: 'GEORGE is not legal, medical, tax, investment, psychological, emergency, or other licensed professional advice.',
  },
  {
    title: 'Payments',
    body: 'Subscriptions may renew automatically until canceled under the billing terms presented at checkout. You are responsible for reviewing plan terms before purchase.',
  },
  {
    title: 'Acceptable Use',
    body: 'Do not use GEORGE for fraud, harassment, illegal conduct, abuse, rights violations, security attacks, impersonation, or activity that creates risk for the platform or other users.',
  },
  {
    title: 'Service Changes',
    body: 'Features, pricing, models, and availability may change at any time. Continued use of the service means you accept those changes.',
  },
  {
    title: 'Limitation of Liability',
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
    <PageShell title="" eyebrow="" backToGeorge withSidebar={false}>
      <div className="w-full max-w-[980px] bg-black">
        <section className="border-b border-white/10 pb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.32em] text-white/40">
            Agreement
          </div>

          <h1 className="mt-4 font-mono text-[42px] font-black uppercase leading-[0.9] tracking-[-0.075em] text-white md:text-[72px]">
            Terms of Access
          </h1>

          <p className="mt-6 max-w-[680px] text-[18px] leading-8 text-white/62 md:text-[21px]">
            Access gives you the ability to use GEORGE as an operational workspace. Use it responsibly and keep final judgment with yourself.
          </p>
        </section>

        <section className="divide-y divide-white/10">
          {sections.map((section) => (
            <div key={section.title} className="py-6">
              <h2 className="font-mono text-[15px] font-semibold uppercase tracking-[0.18em] text-white/90">
                {section.title}
              </h2>

              <p className="mt-3 max-w-[760px] text-[17px] leading-8 text-white/58">
                {section.body}
              </p>
            </div>
          ))}
        </section>

        <section className="border-t border-white/10 py-6">
          <div className="font-mono text-[15px] font-semibold uppercase tracking-[0.18em] text-white/90">
            Final Position
          </div>

          <p className="mt-3 max-w-[760px] text-[17px] leading-8 text-white/62">
            GEORGE supports the work. You remain the authority.
          </p>
        </section>
      </div>
    </PageShell>
  )
}
