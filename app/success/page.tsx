'use client'

import PageShell from '@/components/layout/PageShell'

export default function SuccessPage() {
  return (
    <PageShell
      title="Access granted"
      eyebrow="Access"
      backToGeorge
      withSidebar={false}
    >
      <div className="max-w-3xl space-y-8">
        <section className="rounded-[1rem] border border-white/[0.06] bg-white/[0.018] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] md:p-8">
          <div className="space-y-4">
            <p className="text-lg font-medium text-white">
              Access is active.
            </p>

            <p className="text-sm leading-7 text-neutral-300 md:text-base">
              GEORGE can now restore continuity on this device and support the level of operational awareness you selected.
            </p>

            <p className="text-sm text-white">
              Continue with GEORGE, or shape how GEORGE supports your work.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => (window.location.href = '/george')}
            className="george-access-action rounded-full px-6 py-3 text-sm font-medium"
          >
            Continue with GEORGE
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = '/george?intent=make-george-yours')}
            className="george-secondary-action rounded-full px-6 py-3 text-sm font-medium"
          >
            Shape GEORGE
          </button>
        </section>
      </div>
    </PageShell>
  )
}
