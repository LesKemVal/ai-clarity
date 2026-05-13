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
    <div className="sticky top-0 z-40 border-b border-white/[0.045] bg-black/90 backdrop-blur xl:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center text-[#7C8CFF]"
          aria-label="Open menu"
        >
          <span className="flex flex-col gap-[3px]">
            <span className="block h-[1.5px] w-4 rounded-full bg-current" />
            <span className="block h-[1.5px] w-4 rounded-full bg-current" />
            <span className="block h-[1.5px] w-4 rounded-full bg-current" />
          </span>
        </button>

        <div className="text-sm tracking-[0.24em] text-white">
          BRANESx
        </div>

        <div className="w-9" />
      </div>
    </div>
  )
}
