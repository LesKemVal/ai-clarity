'use client'

import Link from 'next/link'

type BxPageHeaderProps = {
  backHref?: string
  backLabel?: string
  rightSlot?: React.ReactNode
}

export default function BxPageHeader({
  backHref = '/george',
  backLabel = 'Back',
  rightSlot,
}: BxPageHeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between border-b border-white/[0.055] pb-4">
      <div className="flex items-center gap-3">
        <Link
          href="/george"
          aria-label="Go to GEORGE"
          className="flex h-[54px] w-[54px] items-center justify-center rounded-[1rem] border border-white/[0.04] bg-white/[0.018] transition hover:border-white/[0.08] hover:bg-white/[0.032]"
        >
          <img
            src="/logofav.png"
            alt="BRANESx"
            className="h-[44px] w-[44px] rounded-[0.85rem] object-contain opacity-95"
          />
        </Link>

        <Link
          href={backHref}
          className="rounded-full border border-white/[0.055] bg-black/20 px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/44 transition hover:border-white/[0.11] hover:bg-white/[0.024] hover:text-white/76"
        >
          {backLabel}
        </Link>
      </div>

      {rightSlot ? <div className="flex items-center justify-end">{rightSlot}</div> : null}
    </header>
  )
}
