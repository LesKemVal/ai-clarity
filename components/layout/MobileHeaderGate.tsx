'use client'

import { usePathname } from 'next/navigation'
import MobileHeader from '@/components/MobileHeader'

export default function MobileHeaderGate() {
  const pathname = usePathname()

  if (pathname === '/' || pathname.startsWith('/top-up') || pathname.startsWith('/george') || pathname.startsWith('/help') || pathname.startsWith('/legal/toa')) return null

  return <MobileHeader showMenu={false} />
}
