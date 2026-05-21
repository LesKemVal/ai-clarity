type LiveSignalMarkProps = {
  className?: string
}

export default function LiveSignalMark({ className = '' }: LiveSignalMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-4 w-4 items-center justify-center ${className}`}
    >
      <span className="absolute h-3.5 w-3.5 rounded-full border border-current opacity-55" />
      <span className="absolute h-2 w-2 rounded-full border border-current opacity-75" />
      <span className="h-1 w-1 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
      <span className="absolute -right-0.5 top-0 h-1.5 w-1.5 rounded-full border border-current opacity-50" />
    </span>
  )
}
