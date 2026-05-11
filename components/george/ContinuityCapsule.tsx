type ContinuityCapsuleProps = {
  email: string
  onClear?: () => void
  label?: string
}

export default function ContinuityCapsule({
  email,
  onClear,
  label = 'Continuing as',
}: ContinuityCapsuleProps) {
  const cleanEmail = email.trim().toLowerCase()

  if (!cleanEmail) return null

  return (
    <div className="mt-4 flex items-center gap-2 rounded-full border border-[#7C8CFF]/14 bg-[#7C8CFF]/[0.05] px-3 py-1.5">
      <div className="h-2 w-2 rounded-full bg-[#7C8CFF]/80" />
      <span className="max-w-[190px] truncate text-[11px] font-medium tracking-[0.02em] text-white/58">
        {label} {cleanEmail}
      </span>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] uppercase tracking-[0.16em] text-white/28 transition hover:text-white/58"
        >
          Not you?
        </button>
      )}
    </div>
  )
}
