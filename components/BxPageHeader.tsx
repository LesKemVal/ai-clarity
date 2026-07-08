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
  const showBack = Boolean(backLabel)
  const backClass =
    'rounded-[0.78rem] border border-[#6F86FF]/40 bg-[#4169E1] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_0_24px_rgba(65,105,225,0.28)] transition hover:bg-[#5478F0] hover:text-white'

  return (
    <header className="relative mb-5 flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-6">
        <Link href="/" aria-label="Go to BRANESx home" className="group flex h-[78px] w-[78px] shrink-0 items-center justify-center">
          <img src="/logofav.png" alt="Bx" className="h-[72px] w-[72px] object-contain opacity-[0.96] transition group-hover:opacity-100" />
        </Link>

        {showBack && onBack ? (
          <button type="button" onClick={onBack} className={backClass}>
            {backLabel}
          </button>
        ) : showBack ? (
          <Link href={backHref} className={backClass}>
            {backLabel}
          </Link>
        ) : null}
      </div>

      {rightSlot ? <div className="flex shrink-0 items-center justify-end">{rightSlot}</div> : null}
    </header>
  )
}
