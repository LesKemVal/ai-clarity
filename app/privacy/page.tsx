'use client'

import PageShell from '@/components/layout/PageShell'

export default function PrivacyPage() {
  return (
    <PageShell eyebrow="Privacy" title="Privacy" backToGeorge>
      <div className="max-w-4xl">
        <section className="border-b border-white/[0.06] pb-7 md:pb-8">
          <p className="max-w-3xl font-mono text-[18px] font-semibold uppercase leading-[1.2] tracking-[0.12em] text-[#8FB6C9]/82 md:text-[24px]">
            Your conversations. Your documents. Your information. Your control.
          </p>
        </section>

        <section className="divide-y divide-white/[0.055]">
          <div className="py-6 md:grid md:grid-cols-[180px_minmax(0,1fr)] md:gap-8 md:py-7">
            <h2 className="text-[15px] font-semibold text-white/92">Your Conversations</h2>
            <p className="mt-2 leading-7 text-neutral-400 md:mt-0">
              Information you submit may be processed to generate responses, improve functionality, and maintain the service.
            </p>
          </div>

          <div className="py-6 md:grid md:grid-cols-[180px_minmax(0,1fr)] md:gap-8 md:py-7">
            <h2 className="text-[15px] font-semibold text-white/92">Your Documents</h2>
            <p className="mt-2 leading-7 text-neutral-400 md:mt-0">
              Saved sessions, preparation state, and recent items may store data locally in your browser or device environment.
            </p>
          </div>

          <div className="py-6 md:grid md:grid-cols-[180px_minmax(0,1fr)] md:gap-8 md:py-7">
            <h2 className="text-[15px] font-semibold text-white/92">Your Information</h2>
            <p className="mt-2 leading-7 text-neutral-400 md:mt-0">
              GEORGE does not create a public feed of your conversations. Your Information actions are initiated by you.
            </p>
          </div>

          <div className="py-6 md:grid md:grid-cols-[180px_minmax(0,1fr)] md:gap-8 md:py-7">
            <h2 className="text-[15px] font-semibold text-white/92">Security</h2>
            <p className="mt-2 leading-7 text-neutral-400 md:mt-0">
              Reasonable efforts may be used to protect systems and data, but no system can guarantee absolute security.
            </p>
          </div>

          <div className="py-6 md:grid md:grid-cols-[180px_minmax(0,1fr)] md:gap-8 md:py-7">
            <h2 className="text-[15px] font-semibold text-white/92">Your Control</h2>
            <p className="mt-2 leading-7 text-neutral-400 md:mt-0">
              You control what you submit, what you save, what you share, and whether you continue using the service.
            </p>
          </div>
        </section>

        <section className="border-t border-white/[0.08] pt-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/38">
            Final position
          </p>
          <p className="mt-2 text-[17px] leading-7 text-white/84">
            Trust is part of the operating system.
          </p>
        </section>
      </div>
    </PageShell>
  )
}
