'use client'

type MobileHeaderProps = {
  onOpenSidebar: () => void
  onShareGeorge: () => void
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-[14px] w-[14px] text-[#D7DBE4]/54"
    >
      <path d="M7 12v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-7" />
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
    </svg>
  )
}

export default function MobileHeader({
  onOpenSidebar,
  onShareGeorge,
}: MobileHeaderProps) {
  return (
    <div className="xl:hidden flex w-full items-center justify-between">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="inline-flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-[1rem] text-[#D7DBE4]/72 transition hover:bg-white/[0.025] hover:text-[#D7DBE4]"
        aria-label="Open GEORGE menu"
      >
        <span className="h-[2px] w-6 rounded-full bg-current" />
        <span className="h-[2px] w-6 rounded-full bg-current" />
        <span className="h-[2px] w-6 rounded-full bg-current" />
      </button>

      <button
        type="button"
        onClick={onShareGeorge}
        className="inline-flex h-9 items-center justify-center px-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#D7DBE4]/42 transition hover:text-[#D7DBE4]/72"
        aria-label="Share GEORGE"
        title="Share GEORGE"
      >
        <div className="flex items-center gap-2">
          <ShareIcon />
          <span className="tracking-[0.16em] uppercase text-[#D7DBE4]/78">
            Share G
          </span>
        </div>
      </button>
    </div>
  )
}
