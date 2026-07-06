'use client'

import PageShell from '@/components/layout/PageShell'

export default function PrivacyPage() {
  return (
    <PageShell eyebrow="Privacy" title="Privacy" backToGeorge>
      <div className="max-w-4xl space-y-8">

        <section className="rounded-[1rem] border border-white/[0.055] bg-white/[0.018] p-5 md:p-6">
          <div className="font-mono text-[18px] font-semibold uppercase leading-[1.2] tracking-[0.12em] text-[#8FB6C9]/82 md:text-[24px]">
            Your conversations. Your documents. Your information. Your control.
          </div>
        </section>

        <section className="grid gap-4">

          <div className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <h2 className="text-white text-xl font-semibold">Your Conversations</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              Information you submit may be processed to generate responses, improve functionality, and maintain the service.
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <h2 className="text-white text-xl font-semibold">Your Documents</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              Features such as saved responses, folders, and recent items may store data locally in your browser or device environment.
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <h2 className="text-white text-xl font-semibold">Your Information</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              GEORGE does not create a public feed of your conversations. Your Information actions are initiated by you.
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <h2 className="text-white text-xl font-semibold">Security</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              Reasonable efforts may be used to protect systems and data, but no system can guarantee absolute security.
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <h2 className="text-white text-xl font-semibold">Your Control</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              You control what you submit, what you save, what you share, and whether you continue using the service.
            </p>
          </div>

        </section>

        <section className="rounded-[1rem] border border-white/[0.06] bg-white/[0.018] p-5 md:p-5">
          <p className="text-white font-medium">
            Final position
          </p>

          <p className="mt-3 text-neutral-200 leading-7">
            Trust is part of the operating system.
          </p>
        </section>

      </div>
    </PageShell>
  )
}
