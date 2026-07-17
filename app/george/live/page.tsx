'use client'

import { useEffect, useState } from 'react'
import GeorgePage from '../page'

export const dynamic = 'force-dynamic'

function clean(value: unknown) {
  return String(value || '').trim()
}

function isLikelyStaleContext(setup: any, context: string) {
  const objective = clean(setup?.objective).toLowerCase()
  const room = clean(setup?.room).toLowerCase()
  const source = context.toLowerCase()

  const currentLooksLikeInterview = /interview|candidate|job offer|recruiter|hiring/.test(`${objective} ${room}`)
  const contextLooksLikeInterview = /desired outcome:\s*job offer|user role in room:\s*interviewee|\binterviewee\b/.test(source)

  return contextLooksLikeInterview && !currentLooksLikeInterview
}

function buildCurrentBriefingKnowledge(setup: any) {
  const candidates = [
    setup?.roomPackage?.observedReality,
    setup?.observedReality,
    setup?.knownContext,
    setup?.runtimeSupport?.knownContext,
  ]
    .map(clean)
    .filter(Boolean)

  const currentContext = candidates.find((value) => !isLikelyStaleContext(setup, value)) || ''

  const lines = [
    clean(setup?.objective) ? `Desired outcome: ${clean(setup.objective)}` : '',
    clean(setup?.room) ? `Room: ${clean(setup.room)}` : '',
    clean(setup?.chair || setup?.userPosition) ? `User role in room: ${clean(setup?.chair || setup?.userPosition)}` : '',
    clean(setup?.audienceType) ? `Speaking with: ${clean(setup.audienceType)}` : '',
    currentContext ? `Known context: ${currentContext}` : '',
  ].filter(Boolean)

  return lines.join('\n')
}

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

      const briefingKnowledge = buildCurrentBriefingKnowledge(setup)
      const currentKnownContext = clean(
        setup?.roomPackage?.observedReality ||
        setup?.observedReality ||
        setup?.knownContext ||
        setup?.runtimeSupport?.knownContext
      )
      const safeKnownContext = isLikelyStaleContext(setup, currentKnownContext)
        ? briefingKnowledge
        : currentKnownContext || briefingKnowledge

      const synchronizedRuntimeSupport = {
        ...(setup.runtimeSupport || {}),
        room: setup.room,
        objective: setup.objective,
        chair: setup.chair,
        knownContext: safeKnownContext,
        briefingKnowledge,
      }

      const synchronizedSetup = {
        ...setup,
        knownContext: safeKnownContext,
        observedReality: safeKnownContext,
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
