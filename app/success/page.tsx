'use client'

import PageShell from '@/components/layout/PageShell'

export default function SuccessPage() {
  return (
    <PageShell
      title="You’re on the waitlist"
      eyebrow="Beta"
      backToGeorge
      withSidebar={false}
    >
      <div className="max-w-3xl space-y-8">
        <section className="rounded-3xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="space-y-4">
            <p className="text-lg font-medium text-white">
              You’re on the waitlist.
            </p>

            <p className="text-sm leading-7 text-neutral-300 md:text-base">
              Thanks for your interest in GEORGE during beta.
            </p>

            <p className="text-sm text-white">
              Keep using GEORGE. Keep sending signal. We’ll notify users as launch gets closer.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => (window.location.href = '/george')}
            className="rounded-full bg-[#7C8CFF] px-6 py-3 text-sm font-medium text-black transition button-press hover:opacity-90"
          >
            Continue with GEORGE
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = '/top-up')}
            className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-medium text-neutral-200 transition button-press hover:border-[#7C8CFF] hover:text-[#7C8CFF]"
          >
            Return to beta access
          </button>
        </section>
      </div>
    </PageShell>
  )
}
