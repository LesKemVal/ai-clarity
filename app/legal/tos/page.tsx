'use client'

import PageShell from '@/components/layout/PageShell'

export default function TosPage() {
  return (
    <PageShell eyebrow="Legal" title="Terms of Service" backToGeorge>
      <div className="max-w-4xl space-y-8">

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-semibold text-white">
              Terms of Service
            </h1>

            <p className="text-neutral-300 leading-7">
              These terms govern your use of GEORGE, BRANESx, and related pages, tools, and subscriptions.
            </p>

            <p className="text-neutral-400 leading-7">
              By using the service, you agree to use it responsibly and within the boundaries below.
            </p>
          </div>
        </section>

        <section className="grid gap-4">

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6">
            <h2 className="text-white text-xl font-semibold">Use of Service</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              GEORGE is designed for clarity, direction, planning, communication support, and execution assistance.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6">
            <h2 className="text-white text-xl font-semibold">No Guaranteed Results</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              Outcomes depend on your judgment, timing, actions, market conditions, and other factors outside our control.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6">
            <h2 className="text-white text-xl font-semibold">User Responsibility</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              You remain responsible for decisions, filings, purchases, relationships, negotiations, health choices, and financial actions.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6">
            <h2 className="text-white text-xl font-semibold">Acceptable Use</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              Do not use the service for fraud, harassment, abuse, illegal conduct, security attacks, impersonation, or rights violations.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6">
            <h2 className="text-white text-xl font-semibold">Billing</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              Paid subscriptions may renew automatically until canceled under the billing terms presented at checkout.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6">
            <h2 className="text-white text-xl font-semibold">Availability</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              Features, pricing, models, responses, and availability may change or improve over time.
            </p>
          </div>

        </section>

        <section className="rounded-3xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 p-6 md:p-8">
          <p className="text-white font-medium">
            Final position
          </p>

          <p className="mt-3 text-neutral-200 leading-7">
            GEORGE can support your thinking and execution.
          </p>

          <p className="mt-2 text-neutral-300 leading-7">
            You remain the decision-maker.
          </p>
        </section>

      </div>
    </PageShell>
  )
}
