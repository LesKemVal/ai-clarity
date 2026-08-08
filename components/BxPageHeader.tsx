'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

type BxPageHeaderProps = {
  backHref?: string
  backLabel?: string
  onBack?: () => void
  rightSlot?: React.ReactNode
}

export default function BxPageHeader({
  backHref,
  backLabel = 'BACK',
  onBack,
  rightSlot,
}: BxPageHeaderProps) {
  const router = useRouter()
  const showBack = Boolean(backLabel)

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }

    if (backLabel === 'GEORGE') {
      router.push(backHref || '/george')
      return
    }

    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    router.push(backHref || '/')
  }
  const backClass =
    'inline-flex h-[30px] items-center justify-center rounded-[0.56rem] border border-[#7EA1FF]/35 bg-[#4E7CFF] px-4 font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-white shadow-[0_8px_22px_rgba(20,61,168,0.2)] transition-colors hover:bg-[#5A84FF] active:bg-[#426FE8]'

  return (
    <header className="relative mb-6 flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-6 sm:gap-7">
        <Link href="/" aria-label="Go to BRANESx home" className="group flex h-[68px] w-[68px] shrink-0 items-center justify-center">
          <img src="/logofav.png" alt="Bx" className="h-[62px] w-[62px] object-contain opacity-[0.96] transition group-hover:opacity-100" />
        </Link>

        {showBack ? (
          <button type="button" onClick={handleBack} className={backClass}>
            <span aria-hidden="true">←</span>
            <span>{backLabel === 'GEORGE' ? 'Back to GEORGE' : backLabel}</span>
          </button>
        ) : null}
      </div>

      {rightSlot ? <div className="flex shrink-0 items-center justify-end">{rightSlot}</div> : null}
    </header>
  )
}
