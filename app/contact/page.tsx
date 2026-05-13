'use client'

import PageShell from '@/components/layout/PageShell'

export default function ContactPage() {
  return (
    <PageShell eyebrow="Contact" title="Get in touch" backToGeorge>
      <div className="max-w-3xl space-y-6">
        <section className="rounded-2xl bg-neutral-950 p-6 md:p-8">
          <p className="text-sm leading-7 text-neutral-400">
            Reach out if you need support, have a question, or want to talk about GEORGE.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-neutral-950 p-6">
            <p className="text-sm font-medium text-white">Email</p>
            <p className="mt-2 text-sm text-neutral-400">support@branes.ai</p>
          </div>

          <div className="rounded-2xl bg-neutral-950 p-6">
            <p className="text-sm font-medium text-white">Response</p>
            <p className="mt-2 text-sm text-neutral-400">We’ll get back to you as quickly as we can.</p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
