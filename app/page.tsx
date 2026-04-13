'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const active = localStorage.getItem('george_active')

    if (active === 'true') {
      router.replace('/george')
    } else {
      router.replace('/landing')
    }
  }, [router])

  return null
}
