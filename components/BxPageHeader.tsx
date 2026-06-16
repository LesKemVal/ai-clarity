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
    <header className="relative mb-5 flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/" aria-label="Go to BRANESx home" className="group flex h-10 w-10 shrink-0 items-center justify-center">
          <img src="/logofav.png" alt="Bx" className="h-9 w-9 object-contain opacity-[0.92] transition group-hover:opacity-100" />
        </Link>

        <Link href={backHref} className="inline-flex items-center gap-2 truncate text-[10px] font-medium uppercase tracking-[0.22em] text-white/30 transition hover:text-white/62">
          <span className="text-[13px] leading-none text-white/[0.22]">←</span>
          <span className="truncate">{backLabel}</span>
        </Link>
      </div>

      {rightSlot ? <div className="flex shrink-0 items-center justify-end">{rightSlot}</div> : null}
    </header>
  )
}
