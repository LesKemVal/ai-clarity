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
    <main className="flex min-h-[100dvh] items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-[460px] border-t border-white/[0.08] pt-6 text-center">
        <div className="text-[11px] uppercase tracking-[0.3em] text-white/36">BRANESx</div>

        <h1 className="mt-4 text-[30px] font-semibold leading-[1.0] tracking-[-0.045em] text-white/92">
          Reset GEORGE
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/58">{status}</p>

        <button
          type="button"
          onClick={resetDevice}
          className="george-secondary-action mt-5 w-full rounded-[0.75rem] px-4 py-3 text-sm font-semibold"
        >
          Clear This Device Again
        </button>
      </div>
    </main>
  )
}
