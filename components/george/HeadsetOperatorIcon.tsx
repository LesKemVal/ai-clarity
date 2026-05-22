type HeadsetOperatorIconProps = {
  className?: string
}

export default function HeadsetOperatorIcon({
  className = '',
}: HeadsetOperatorIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 13a8 8 0 1 1 16 0" />
      <path d="M4 13v3a2 2 0 0 0 2 2h2v-6H6a2 2 0 0 0-2 2Z" />
      <path d="M20 13v3a2 2 0 0 1-2 2h-2v-6h2a2 2 0 0 1 2 2Z" />
      <path d="M12 18v2" />
    </svg>
  )
}
