'use client'

import { useEffect, useState } from 'react'
import GeorgePage from '../page'

export const dynamic = 'force-dynamic'

export default function GeorgeLivePage() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const preparedRaw = window.localStorage.getItem('GEORGE_LIVE_SETUP')
      const activeRaw = window.localStorage.getItem('george_live_setup_active')

      const prepared = preparedRaw ? JSON.parse(preparedRaw) : null
      const active = activeRaw ? JSON.parse(activeRaw) : null

      const setup = prepared || active || {
        room: 'LIVE',
        objective: 'Continue the LIVE conversation.',
        knownContext: '',
        liveAssistMode: 'lines',
        controlWords: '',
        createdAt: Date.now(),
        localFallback: true,
      }

      const currentKnownContext = String(
        setup.knownContext ||
        setup.observedReality ||
        setup.runtimeSupport?.knownContext ||
        ''
      ).trim()

      const synchronizedRuntimeSupport = {
        ...(setup.runtimeSupport || {}),
        room: setup.room,
        objective: setup.objective,
        chair: setup.chair,
        knownContext: currentKnownContext,
        briefingKnowledge: currentKnownContext,
      }

      const synchronizedSetup = {
        ...setup,
        knownContext: currentKnownContext,
        observedReality: currentKnownContext,
        runtimeSupport: synchronizedRuntimeSupport,
      }

      const serializedSetup = JSON.stringify(synchronizedSetup)
      const serializedSupport = JSON.stringify(synchronizedRuntimeSupport)

      window.localStorage.setItem('GEORGE_LIVE_SETUP', serializedSetup)
      window.localStorage.setItem('george_live_setup_active', serializedSetup)
      window.localStorage.setItem('george_live_runtime_support_active', serializedSupport)
      window.localStorage.setItem('george_live_runtime_support', serializedSupport)
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
