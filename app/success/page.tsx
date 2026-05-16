'use client'

import PageShell from '@/components/layout/PageShell'

export default function SuccessPage() {
  return (
    <PageShell
      title="You’re in."
      eyebrow="Access active"
      backToGeorge
      withSidebar={false}
    >
      <div className="max-w-3xl space-y-8">
        <section className="rounded-[1rem] border border-[#7C8CFF]/30 bg-white/[0.055] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="space-y-4">
            <p className="text-lg font-medium text-white">
              You’re in.
            </p>

            <p className="text-sm leading-7 text-neutral-300 md:text-base">
              Your access is active. GEORGE can now restore subscriber continuity on this device and support the tier you selected.
            </p>

            <p className="text-sm text-white">
              Continue now, or personalize GEORGE when you are ready.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => (window.location.href = '/george')}
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition button-press hover:opacity-90"
          >
            Continue with GEORGE
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = '/george?intent=make-george-yours')}
            className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-medium text-neutral-200 transition button-press hover:border-white/[0.18] hover:text-white"
          >
            Make GEORGE Yours
          </button>
        </section>
      </div>
    </PageShell>
  )
}
