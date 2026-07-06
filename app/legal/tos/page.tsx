'use client'

import PageShell from '@/components/layout/PageShell'

const sections = [
  {
    title: 'Use of Service',
    body: 'GEORGE supports clarity, planning, communication, preparation, and execution assistance. GEORGE is software. GEORGE is not a substitute for legal, medical, tax, investment, emergency, or professional judgment.',
  },
  {
    title: 'No Guaranteed Results',
    body: 'Outcomes depend on your judgment, timing, actions, market conditions, the people involved, and other factors outside our control.',
  },
  {
    title: 'User Responsibility',
    body: 'You remain responsible for decisions, filings, purchases, relationships, negotiations, health choices, financial actions, and conduct.',
  },
  {
    title: 'Acceptable Use',
    body: 'Do not use the service for fraud, harassment, abuse, illegal conduct, security attacks, impersonation, rights violations, or activity that creates risk for other users or the platform.',
  },
  {
    title: 'Billing',
    body: 'Paid subscriptions may renew automatically until canceled under the billing terms presented at checkout. You are responsible for reviewing plan details, renewal terms, and cancellation timing.',
  },
  {
    title: 'Availability',
    body: 'Features, pricing, models, responses, and availability may change, improve, or be withdrawn over time. Continued use of the service means you accept those changes.',
  },
]

export default function TosPage() {
  return (
    <PageShell eyebrow="" title="" backToGeorge>
      <div className="w-full max-w-[980px] bg-black">
        <section className="border-b border-white/10 pb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.32em] text-white/40">
            Legal
          </div>

          <h1 className="mt-4 font-mono text-[42px] font-black uppercase leading-[0.9] tracking-[-0.075em] text-white md:text-[72px]">
            Terms of Service
          </h1>

          <p className="mt-6 max-w-[680px] text-[18px] leading-8 text-white/62 md:text-[21px]">
            Use GEORGE responsibly. GEORGE can help you reason, plan, prepare, communicate, and execute, but you remain responsible for your decisions and actions.
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
