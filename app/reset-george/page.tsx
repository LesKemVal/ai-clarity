'use client'

import { useEffect, useState } from 'react'

export default function ResetGeorgePage() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    try {
      const keys = Object.keys(window.localStorage)

      keys.forEach((key) => {
        const lower = key.toLowerCase()

        if (
          lower.includes('george') ||
          lower.includes('session') ||
          lower.includes('campaign') ||
          lower.includes('untitled') ||
          lower.includes('live_setup') ||
          lower.includes('active_normal') ||
          lower.includes('active_live')
        ) {
          window.localStorage.removeItem(key)
        }
      })

      window.localStorage.removeItem('GEORGE_SESSIONS')
      window.localStorage.removeItem('GEORGE_MEMORY')
      window.sessionStorage.clear()
    } catch {}

    setDone(true)

    window.setTimeout(() => {
      window.location.href = '/george'
    }, 900)
  }, [])

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#050608] px-6 text-white">
      <div className="w-full max-w-[420px] rounded-[1.2rem] border border-white/[0.07] bg-[#10131B]/80 p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
        <div className="text-[11px] uppercase tracking-[0.3em] text-white/36">
          BRANESx
        </div>

        <h1 className="mt-4 text-[30px] font-semibold leading-[1.0] tracking-[-0.045em] text-white/92">
          Resetting GEORGE.
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/52">
          {done ? 'Old sessions cleared. Returning to GEORGE.' : 'Clearing saved sessions.'}
        </p>
      </div>
    </main>
  )
}
