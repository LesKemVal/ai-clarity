'use client'

import PageShell from '@/components/layout/PageShell'

export default function ContactPage() {
  return (
    <PageShell eyebrow="Contact" title="Contact" backToGeorge>
      <div className="max-w-3xl space-y-6">
        <section className="rounded-[1rem] border border-white/[0.055] bg-white/[0.018] p-5 md:p-6">
          <div className="font-mono text-[18px] font-semibold uppercase leading-[1.2] tracking-[0.12em] text-[#8FB6C9]/82 md:text-[24px]">
            Questions. Support. Partnerships. Enterprise.
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1rem] bg-white/[0.018] p-5">
            <p className="text-sm font-medium text-white">Email</p>
            <p className="mt-2 text-sm text-neutral-400">support@branes.ai</p>
          </div>

          <div className="rounded-[1rem] bg-white/[0.018] p-5">
            <p className="text-sm font-medium text-white">Response</p>
            <p className="mt-2 text-sm text-neutral-400">We respond as soon as possible.</p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
