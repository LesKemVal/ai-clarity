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
    'inline-flex h-[26px] items-center justify-center rounded-[0.46rem] border border-[#6F86FF]/35 bg-[#4169E1] px-2.5 text-[8.5px] font-semibold uppercase leading-none tracking-[0.16em] text-white shadow-[0_0_14px_rgba(65,105,225,0.22)] transition hover:bg-[#5478F0] hover:text-white'

  return (
    <header className="relative mb-5 flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/" aria-label="Go to BRANESx home" className="group flex h-[58px] w-[58px] shrink-0 items-center justify-center">
          <img src="/logofav.png" alt="Bx" className="h-[52px] w-[52px] object-contain opacity-[0.96] transition group-hover:opacity-100" />
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
