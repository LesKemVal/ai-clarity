'use client'

import { useRouter } from 'next/navigation'

export default function BackButton({
  label = 'Back',
}: {
  label?: string
}) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-[#7C8CFF]"
    >
      ← {label}
    </button>
  )
}
