'use client'

import { useEffect, useState } from 'react'
import GeorgePage from '../page'

export const dynamic = 'force-dynamic'

export default function GeorgeLivePage() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const existing =
        window.localStorage.getItem('george_live_setup_active') ||
        window.localStorage.getItem('GEORGE_LIVE_SETUP')

      if (!existing) {
        const fallbackSetup = {
          room: 'LIVE',
          objective: 'Continue the LIVE conversation.',
          knownContext: '',
          liveAssistMode: 'lines',
          controlWords: '',
          createdAt: Date.now(),
          localFallback: true,
        }

        window.localStorage.setItem('GEORGE_LIVE_SETUP', JSON.stringify(fallbackSetup))
        window.localStorage.setItem('george_live_setup_active', JSON.stringify(fallbackSetup))
      }
    } catch {}

    setReady(true)
  }, [])

  if (!ready) return null

  return (
    <div className="george-live-route">
      <style dangerouslySetInnerHTML={{ __html: `
        .george-live-route [data-normal-hero],
        .george-live-route [data-george-normal-hero],
        .george-live-route .normal-george-hero {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
      ` }} />
      <GeorgePage forceLive />
    </div>
  )
}
