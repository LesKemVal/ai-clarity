'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { setActiveMode } from '@/lib/george/session/store'

export default function GeorgeLivePage() {
  const router = useRouter()
  const [entering, setEntering] = useState(true)

  useEffect(() => {
    setActiveMode('live')
    const t = setTimeout(() => setEntering(false), 550)
    return () => clearTimeout(t)
  }, [])

  function goNormal() {
    setActiveMode('normal')
    router.push('/george')
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(124,140,255,0.15),transparent_40%),#020202]" />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur-xl px-5 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <div className="text-[10px] tracking-[0.4em] text-white/40">GEORGE</div>
            <div className="text-sm tracking-[0.25em] text-white/90">LIVE</div>
          </div>

          <button
            onClick={goNormal}
            className="px-4 py-2 rounded-full border border-white/15 bg-white/[0.05] text-xs tracking-[0.2em] hover:bg-white/[0.1]"
          >
            NORMAL
          </button>
        </div>
      </div>

      {/* Center */}
      <div className="flex items-center justify-center min-h-screen pt-20 pb-24 px-5 relative z-10">
        <div className="max-w-xl w-full bg-white/[0.04] border border-white/10 rounded-2xl p-7 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.8)]">

          <div className="mb-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
            <div className="text-sm text-white/60">Signal open</div>
          </div>

          <div className="text-2xl font-semibold mb-3">
            I’m listening.
          </div>

          <div className="text-sm text-white/60">
            Live assistance is active. Short cues. Real-time support.
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/70 backdrop-blur-xl p-4">
        <div className="max-w-4xl mx-auto flex gap-2 justify-center bg-white/[0.05] border border-white/10 rounded-full p-2">

          <button className="px-4 py-2 rounded-full bg-white text-black text-xs tracking-[0.2em]">
            CUE
          </button>

          <button className="px-4 py-2 rounded-full text-white/70 text-xs tracking-[0.2em]">
            LINE
          </button>

          <button className="px-4 py-2 rounded-full text-white/70 text-xs tracking-[0.2em]">
            OBJECT
          </button>

          <button className="px-4 py-2 rounded-full text-white/70 text-xs tracking-[0.2em]">
            NEGOTIATE
          </button>

          <button
            onClick={goNormal}
            className="px-4 py-2 rounded-full text-white/70 text-xs tracking-[0.2em]"
          >
            NORMAL
          </button>

        </div>
      </div>

      {/* Transition Overlay */}
      {entering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <div className="text-center">
            <div className="mb-6 w-16 h-16 mx-auto rounded-full bg-white/10 shadow-[0_0_60px_rgba(124,140,255,0.5)]" />
            <div className="text-[10px] tracking-[0.4em] text-white/40">GEORGE</div>
            <div className="text-xl mt-3">Live mode</div>
            <div className="text-sm text-white/50 mt-2">Stay with me.</div>
          </div>
        </div>
      )}

    </main>
  )
}
