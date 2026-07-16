type ShareIconProps = {
  className?: string
}

export function ShareIcon({ className = 'h-4 w-4' }: ShareIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="18" cy="5" r="2.35" />
      <circle cx="6" cy="12" r="2.35" />
      <circle cx="18" cy="19" r="2.35" />
      <path d="m8.1 10.9 7.8-4.7" />
      <path d="m8.1 13.1 7.8 4.7" />
    </svg>
  )
}
