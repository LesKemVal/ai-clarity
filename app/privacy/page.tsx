'use client'

import PageShell from '@/components/layout/PageShell'

export default function PrivacyPage() {
  return (
    <PageShell eyebrow="Privacy" title="Privacy" backToGeorge>
      <div className="max-w-3xl space-y-6">
        <section className="rounded-3xl bg-neutral-950 p-6 md:p-8 text-sm leading-7 text-neutral-400">
          <p>
            We respect your privacy. This page explains how information is handled when you use GEORGE.
          </p>
        </section>

        <section className="rounded-3xl bg-neutral-950 p-6 md:p-8 space-y-4 text-sm leading-7 text-neutral-400">
          <div>
            <p className="font-medium text-white">Use of information</p>
            <p className="mt-1">
              Information is used to provide and improve the GEORGE experience.
            </p>
          </div>

          <div>
            <p className="font-medium text-white">Sharing</p>
            <p className="mt-1">
              We do not present your information as a public feed. Any sharing action is user-initiated.
            </p>
          </div>

          <div>
            <p className="font-medium text-white">Control</p>
            <p className="mt-1">
              You decide how you use GEORGE and what you choose to submit.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
