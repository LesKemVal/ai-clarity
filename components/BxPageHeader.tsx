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
    'rounded-[0.58rem] border border-[#6F86FF]/40 bg-[#4169E1] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.20em] text-white shadow-[0_0_18px_rgba(65,105,225,0.24)] transition hover:bg-[#5478F0] hover:text-white'

  return (
    <header className="relative mb-5 flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <Link href="/" aria-label="Go to BRANESx home" className="group flex h-[64px] w-[64px] shrink-0 items-center justify-center">
          <img src="/logofav.png" alt="Bx" className="h-[58px] w-[58px] object-contain opacity-[0.96] transition group-hover:opacity-100" />
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
