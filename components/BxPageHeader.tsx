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
    <header className="relative mb-8 overflow-hidden rounded-[1.3rem] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.004))] px-4 py-3 shadow-[0_18px_64px_rgba(0,0,0,0.28)] sm:px-5 sm:py-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_10%,rgba(124,140,255,0.05),transparent_24%),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.024)_1px,transparent_1px)] bg-[size:auto,108px_108px,108px_108px] opacity-55" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/[0.028]" />

      <div className="relative flex min-h-[62px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/george" aria-label="Go to GEORGE" className="group flex shrink-0 items-center gap-4">
            <img src="/logofav.png" alt="BRANESx" className="h-[56px] w-[84px] object-contain opacity-[0.84] transition group-hover:opacity-[0.96]" />
          </Link>

          <Link href={backHref} className="inline-flex items-center gap-2 truncate text-[12px] font-medium tracking-[0.01em] text-white/30 transition hover:text-white/58 sm:text-[13px]">
            <span className="text-[17px] leading-none text-white/[0.24]">←</span>
            <span className="truncate">{backLabel}</span>
          </Link>
        </div>

        {rightSlot ? <div className="flex shrink-0 items-center justify-end">{rightSlot}</div> : null}
      </div>
    </header>
  )
}
