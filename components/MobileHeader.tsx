'use client'

import { IconButton } from '@/components/ui/IconButton'

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
    <div className="sticky top-0 z-40 border-b border-white/[0.045] bg-black/90 xl:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <IconButton
          variant="quiet"
          size="lg"
          onClick={onMenuClick}
          className="text-white/72"
          aria-label="Open menu"
        >
          <span className="flex flex-col gap-[3px]">
            <span className="block h-[1.5px] w-4 rounded-full bg-current" />
            <span className="block h-[1.5px] w-4 rounded-full bg-current" />
            <span className="block h-[1.5px] w-4 rounded-full bg-current" />
          </span>
        </IconButton>

        <div className="text-sm tracking-[0.24em] text-white">
          BRANESx
        </div>

        <div className="w-9" />
      </div>
    </div>
  )
}
