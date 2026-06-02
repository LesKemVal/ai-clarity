'use client'

import { useEffect, useState } from 'react'

export default function ResetGeorgePage() {
  const [status, setStatus] = useState('Ready to clear this device.')

  async function resetDevice() {
    setStatus('Clearing this device...')

    try {
      localStorage.clear()
      sessionStorage.clear()

      if ('caches' in window) {
        const names = await caches.keys()
        await Promise.all(names.map((name) => caches.delete(name)))
      }

      if ('indexedDB' in window && 'databases' in indexedDB) {
        const dbs = await indexedDB.databases()
        await Promise.all(
          dbs
            .map((db) => db.name)
            .filter(Boolean)
            .map((name) =>
              new Promise<void>((resolve) => {
                const req = indexedDB.deleteDatabase(name as string)
                req.onsuccess = () => resolve()
                req.onerror = () => resolve()
                req.onblocked = () => resolve()
              })
            )
        )
      }

      await fetch('/api/george/sessions?all=1', { method: 'DELETE' }).catch(() => null)

      setStatus('Cleared. Reopening GEORGE...')
      window.setTimeout(() => {
        window.location.replace('/george?fresh=1')
      }, 1200)
    } catch {
      setStatus('Clear failed. Use Safari Settings → Advanced → Website Data → branesx.com → Delete.')
    }
  }

  useEffect(() => {
    resetDevice()
  }, [])

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#050608] px-6 text-white">
      <div className="w-full max-w-[460px] rounded-[1.2rem] border border-white/[0.08] bg-[#111620] p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
        <div className="text-[11px] uppercase tracking-[0.3em] text-white/36">BRANESx</div>

        <h1 className="mt-4 text-[30px] font-semibold leading-[1.0] tracking-[-0.045em] text-white/92">
          Reset GEORGE
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/58">{status}</p>

        <button
          type="button"
          onClick={resetDevice}
          className="mt-5 w-full rounded-[0.9rem] border border-[#AAB4FF]/20 bg-[#AAB4FF]/[0.09] px-4 py-3 text-sm font-semibold text-[#D7DCFF]"
        >
          Clear This Device Again
        </button>
      </div>
    </main>
  )
}
