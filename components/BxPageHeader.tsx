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
    'inline-flex h-[28px] items-center justify-center rounded-[0.52rem] border border-[#7EA1FF]/30 bg-[#4E7CFF] px-3.5 font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-white shadow-[0_7px_20px_rgba(20,61,168,0.18)] transition-colors hover:bg-[#5A84FF] active:bg-[#426FE8]'

  return (
    <header className="relative mb-5 flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-7">
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
