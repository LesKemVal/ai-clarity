'use client'

import PageShell from '@/components/layout/PageShell'

export default function ContactPage() {
  return (
    <PageShell eyebrow="Contact" title="Get in touch" backToGeorge>
      <div className="max-w-3xl space-y-6">
        <section className="rounded-[1rem] bg-white/[0.018] p-5 md:p-5">
          <p className="text-sm leading-7 text-neutral-400">
            Support and operational contact.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1rem] bg-white/[0.018] p-5">
            <p className="text-sm font-medium text-white">Email</p>
            <p className="mt-2 text-sm text-neutral-400">support@branes.ai</p>
          </div>

          <div className="rounded-[1rem] bg-white/[0.018] p-5">
            <p className="text-sm font-medium text-white">Response</p>
            <p className="mt-2 text-sm text-neutral-400">Response times vary.</p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
