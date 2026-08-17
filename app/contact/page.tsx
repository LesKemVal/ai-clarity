import PageShell from '@/components/layout/PageShell'

export default function ContactPage() {
  return (
    <PageShell eyebrow="Contact" title="Contact" backToGeorge>
      <div className="max-w-3xl">
        <section className="border-b border-white/[0.06] pb-7 md:pb-8">
          <p className="font-mono text-[18px] font-semibold uppercase leading-[1.2] tracking-[0.12em] text-[#8FB6C9]/82 md:text-[24px]">
            Questions. Support. Partnerships. Enterprise.
          </p>
        </section>

        <section className="divide-y divide-white/[0.055]">
          <div className="py-6 md:grid md:grid-cols-[140px_minmax(0,1fr)] md:gap-8">
            <p className="text-sm font-medium text-white/92">Email</p>
            <p className="mt-2 text-sm text-neutral-400 md:mt-0">support@branes.ai</p>
          </div>

          <div className="py-6 md:grid md:grid-cols-[140px_minmax(0,1fr)] md:gap-8">
            <p className="text-sm font-medium text-white/92">Response</p>
            <p className="mt-2 text-sm text-neutral-400 md:mt-0">We respond as soon as possible.</p>
          </div>
        </section>

        <div className="border-t border-white/[0.06] pt-5">
          <a
            href="/help"
            className="inline-flex text-sm text-[#AEB6FF]/78 transition hover:text-white"
          >
            Read Using GEORGE →
          </a>
        </div>
      </div>
    </PageShell>
  )
}
