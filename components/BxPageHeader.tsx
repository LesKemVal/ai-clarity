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
    <header className="relative mb-5 overflow-hidden rounded-[1.05rem] border border-white/[0.055] bg-white/[0.018] px-3.5 py-2.5 shadow-[0_14px_48px_rgba(0,0,0,0.26)] sm:px-4 sm:py-3">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:108px_108px,108px_108px] opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/[0.024]" />

      <div className="relative flex min-h-[52px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/george" aria-label="Go to GEORGE" className="group flex shrink-0 items-center">
            <img src="/logofav.png" alt="BRANESx" className="h-[44px] w-[70px] object-contain opacity-[0.86] transition group-hover:opacity-[0.96]" />
          </Link>

          <Link href={backHref} className="inline-flex items-center gap-2 truncate text-[11px] font-medium uppercase tracking-[0.18em] text-white/32 transition hover:text-white/62 sm:text-[12px]">
            <span className="text-[14px] leading-none text-white/[0.24]">←</span>
            <span className="truncate">{backLabel}</span>
          </Link>
        </div>

        {rightSlot ? <div className="flex shrink-0 items-center justify-end">{rightSlot}</div> : null}
      </div>
    </header>
  )
}
