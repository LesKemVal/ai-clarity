'use client'

import { usePathname } from 'next/navigation'
import MobileHeader from '@/components/MobileHeader'

export default function MobileHeaderGate() {
  const pathname = usePathname()

  if (
    pathname === '/' ||
    pathname === '/george' ||
    pathname === '/images' || pathname === '/top-up' || pathname === '/signal' || pathname === '/support' || pathname === '/legal/toa' || pathname === '/help' ||
    pathname.startsWith('/george/')
  ) {
    return null
  }

  return <MobileHeader showMenu={false} />
}
