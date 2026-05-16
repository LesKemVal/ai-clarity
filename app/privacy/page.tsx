'use client'

import PageShell from '@/components/layout/PageShell'

export default function PrivacyPage() {
  return (
    <PageShell eyebrow="Privacy" title="Privacy" backToGeorge>
      <div className="max-w-4xl space-y-8">

        <section className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5 md:p-5">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-semibold text-white">
              Privacy
            </h1>

            <p className="text-neutral-300 leading-7">
              GEORGE is built around continuity, clarity, and trust. This page explains how information is handled while you use the system.
            </p>
          </div>
        </section>

        <section className="grid gap-4">

          <div className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <h2 className="text-white text-xl font-semibold">Your Inputs</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              Information you submit may be processed to generate responses, improve functionality, and maintain the service.
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <h2 className="text-white text-xl font-semibold">Saved Items</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              Features such as saved responses, folders, and recent items may store data locally in your browser or device environment.
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <h2 className="text-white text-xl font-semibold">Sharing</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              GEORGE does not create a public feed of your conversations. Sharing actions are initiated by you.
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <h2 className="text-white text-xl font-semibold">Security</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              Reasonable efforts may be used to protect systems and data, but no system can guarantee absolute security.
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018] p-5">
            <h2 className="text-white text-xl font-semibold">Your Choice</h2>
            <p className="mt-3 text-neutral-400 leading-7">
              You control what you submit, what you save, what you share, and whether you continue using the service.
            </p>
          </div>

        </section>

        <section className="rounded-[1rem] border border-[#7C8CFF]/30 bg-white/[0.055] p-5 md:p-5">
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
