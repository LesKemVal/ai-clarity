'use client'

import Link from 'next/link'

type BxPageHeaderProps = {
  backHref?: string
  backLabel?: string
  rightSlot?: React.ReactNode
}

export default function BxPageHeader({
  backHref = '/george',
  backLabel = 'GEORGE',
  rightSlot,
}: BxPageHeaderProps) {
  return (
    <header className="relative mb-10 overflow-hidden rounded-[1.45rem] border border-white/[0.055] bg-[linear-gradient(180deg,rgba(255,255,255,0.024),rgba(255,255,255,0.006))] px-4 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_10%,rgba(124,140,255,0.075),transparent_26%),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,96px_96px,96px_96px] opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/[0.045]" />
      <div className="relative flex min-h-[70px] items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <Link href="/george" aria-label="Go to GEORGE" className="group flex items-center gap-4">
            <img src="/logofav.png" alt="BRANESx" className="h-[64px] w-[96px] object-contain opacity-90 transition group-hover:opacity-100" />
          </Link>

          <Link href={backHref} className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.01em] text-white/35 transition hover:text-white/68">
            <span className="text-[18px] leading-none text-white/28">←</span>
            <span>{backLabel}</span>
          </Link>
        </div>

        {rightSlot ? <div className="flex items-center justify-end">{rightSlot}</div> : null}
      </div>
    </header>
  )
}
