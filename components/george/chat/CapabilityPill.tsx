'use client'

type CapabilityPillProps = {
  label: string
  visible: boolean
  onClick: () => void
}

export default function CapabilityPill({
  label,
  visible,
  onClick,
}: CapabilityPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Use ${label}`}
      className={`inline-flex h-[22px] items-center rounded-full border border-white/[0.08] bg-white/[0.025] px-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#D7DBE4]/52 transition-[opacity,transform,background-color,color,border-color] duration-200 ease-out hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-[#D7DBE4]/82 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-[2px] opacity-0'
      }`}
    >
      {label}
    </button>
  )
}
