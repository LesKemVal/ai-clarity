'use client'

import PageShell from '@/components/layout/PageShell'

export default function CancelPage() {
  return (
    <PageShell
      title="Checkout canceled"
      eyebrow="Return"
      backToGeorge
      withSidebar={false}
    >
      <div className="max-w-3xl space-y-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="space-y-4">
            <p className="text-lg font-medium text-white">
              No problem.
            </p>

            <p className="text-sm leading-7 text-neutral-400 md:text-base">
              Nothing was completed. You can return to GEORGE or try Top-Up again when you’re ready.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => (window.location.href = '/george')}
            className="rounded-full bg-[#7C8CFF] px-6 py-3 text-sm font-medium text-black transition button-press hover:opacity-90"
          >
            Return to GEORGE
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = '/top-up')}
            className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-medium text-neutral-200 transition button-press hover:border-[#7C8CFF] hover:text-[#7C8CFF]"
          >
            Try Top-Up again
          </button>
        </section>
      </div>
    </PageShell>
  )
}
