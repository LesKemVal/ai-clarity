'use client'

import Brand from '@/components/Brand'

type MobileHeaderProps = {
  title?: string
  showMenu?: boolean
  onMenuClick?: () => void
  alertDot?: boolean
}

export default function MobileHeader({
  title,
  showMenu = true,
  onMenuClick,
  alertDot = false,
}: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-40 border-b border-neutral-800 bg-black/90 backdrop-blur xl:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <Brand compact subtitle={title || 'GEORGE'} />
        </div>

        {showMenu && (
          <button
            type="button"
            onClick={onMenuClick}
            className="relative rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-200 transition hover:border-[#7C8CFF] hover:text-[#7C8CFF] button-press"
          >
            Menu
            {alertDot && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 alert-dot-twice" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
