'use client'

import { useRouter } from 'next/navigation'

export default function BackButton({
  label = 'Back',
  fallbackHref = '/',
}: {
  label?: string
  fallbackHref?: string
}) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
    >
      ← {label}
    </button>
  )
}
