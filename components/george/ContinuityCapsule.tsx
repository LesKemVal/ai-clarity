type ContinuityCapsuleProps = {
  email: string
  onClear?: () => void
  label?: string
}

export default function ContinuityCapsule({
  email,
  onClear,
}: ContinuityCapsuleProps) {
  const cleanEmail = email.trim().toLowerCase()

  if (!cleanEmail) return null

  return (
    <div className="mt-3 flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <div className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/45" />
        <span className="relative h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
      </div>

      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/42">
        LIVE
      </span>

      <span className="max-w-[110px] truncate text-[11px] text-white/58">
        {cleanEmail}
      </span>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="ml-1 text-[10px] uppercase tracking-[0.14em] text-red-300/55 transition hover:text-red-200"
        >
          Reset
        </button>
      )}
    </div>
  )
}
