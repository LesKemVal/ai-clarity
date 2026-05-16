'use client'

import PageShell from '@/components/layout/PageShell'

export default function CancelPage() {
  return (
    <PageShell
      title="Nothing was submitted"
      eyebrow="Access"
      backToGeorge
      withSidebar={false}
    >
      <div className="max-w-3xl space-y-8">
        <section className="rounded-[1rem] border border-white/[0.045] bg-white/[0.018]/60 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="space-y-4">
            <p className="text-lg font-medium text-white">
              No problem.
            </p>

            <p className="text-sm leading-7 text-neutral-400 md:text-base">
              Nothing was submitted. You can return to GEORGE now or continue setting up subscriber continuity when you are ready.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => (window.location.href = '/george')}
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition button-press hover:opacity-90"
          >
            Return to GEORGE
          </button>

          <button
            type="button"
            onClick={() => (window.open('/top-up','_blank','noopener,noreferrer'))}
            className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-medium text-neutral-200 transition button-press hover:border-white/[0.18] hover:text-white"
          >
            Back to continuity options
          </button>
        </section>
      </div>
    </PageShell>
  )
}
