'use client'

import { useEffect, useState } from 'react'
import PageShell from '@/components/layout/PageShell'

export default function SuccessPage() {
  const [headline, setHeadline] = useState('Full capacity restored')
  const [subline, setSubline] = useState('We can keep going now.')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hasUsed = localStorage.getItem('GEORGE_HAS_USED')
    const usageLevel = localStorage.getItem('GEORGE_USAGE_LEVEL')

    localStorage.setItem('GEORGE_ACTIVE', 'true')

    if (!hasUsed) {
      setHeadline('Full capacity unlocked')
      setSubline('You can now use GEORGE without limits.')
    } else {
      setHeadline('Full capacity restored')
      setSubline('We can pick up where you left off.')
    }

    if (usageLevel === 'heavy') {
      setHeadline('You’re using GEORGE at full strength')
      setSubline('If you’re hitting limits often, a higher tier may make sense.')
    }
  }, [])

  return (
    <PageShell
      title={headline}
      eyebrow="Restored"
      backToGeorge
      withSidebar={false}
    >
      <div className="max-w-3xl space-y-8">
        <section className="rounded-3xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:p-8">
          <div className="space-y-4">
            <p className="text-lg font-medium text-white">
              {headline}.
            </p>

            <p className="text-sm leading-7 text-neutral-300 md:text-base">
              {subline}
            </p>

            <p className="text-sm text-white">
              Pick it back up. We can finish this.
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
            Manage subscription
          </button>
        </section>
      </div>
    </PageShell>
  )
}
