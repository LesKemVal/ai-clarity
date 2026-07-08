'use client'

import Link from 'next/link'

type BxPageHeaderProps = {
  backHref?: string
  backLabel?: string
  onBack?: () => void
  rightSlot?: React.ReactNode
}

export default function BxPageHeader({
  backHref = '/george',
  backLabel = 'GEORGE',
  onBack,
  rightSlot,
}: BxPageHeaderProps) {
  return (
    <header className="relative mb-5 flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/" aria-label="Go to BRANESx home" className="group flex h-12 w-12 shrink-0 items-center justify-center">
          <img src="/logofav.png" alt="Bx" className="h-11 w-11 object-contain opacity-[0.94] transition group-hover:opacity-100" />
        </Link>

        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-[0.62rem] border border-[#8FB6C9]/50 bg-[#8FB6C9] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#071016] shadow-[0_0_18px_rgba(143,182,201,0.18)] transition hover:bg-[#A7C8D8] hover:text-black"
          >
            {backLabel}
          </button>
        ) : (
          <Link href={backHref} className="rounded-[0.62rem] border border-[#8FB6C9]/50 bg-[#8FB6C9] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#071016] shadow-[0_0_18px_rgba(143,182,201,0.18)] transition hover:bg-[#A7C8D8] hover:text-black">
            {backLabel}
          </Link>
        )}
      </div>

      {rightSlot ? <div className="flex shrink-0 items-center justify-end">{rightSlot}</div> : null}
    </header>
  )
}
