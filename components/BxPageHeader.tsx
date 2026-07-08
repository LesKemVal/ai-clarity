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
  backLabel = 'BACK',
  onBack,
  rightSlot,
}: BxPageHeaderProps) {
  const backClass =
    'rounded-[0.72rem] border border-[#8FB6C9]/45 bg-[#1B2C36] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#F2F4FF] shadow-[0_0_18px_rgba(143,182,201,0.12)] transition hover:border-[#8FB6C9]/65 hover:bg-[#223947] hover:text-white'

  return (
    <header className="relative mb-5 flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/" aria-label="Go to BRANESx home" className="group flex h-12 w-12 shrink-0 items-center justify-center">
          <img src="/logofav.png" alt="Bx" className="h-11 w-11 object-contain opacity-[0.94] transition group-hover:opacity-100" />
        </Link>

        {onBack ? (
          <button type="button" onClick={onBack} className={backClass}>
            {backLabel}
          </button>
        ) : (
          <Link href={backHref} className={backClass}>
            {backLabel}
          </Link>
        )}
      </div>

      {rightSlot ? <div className="flex shrink-0 items-center justify-end">{rightSlot}</div> : null}
    </header>
  )
}
