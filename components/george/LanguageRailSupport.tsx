'use client'

import { useEffect, useState } from 'react'

const LANGUAGE_OPTIONS = ['English', 'Español', 'Français', 'العربية', '中文', '日本語']

export default function LanguageRailSupport() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(() => {
    if (typeof window === 'undefined') return 'English'
    return window.localStorage.getItem('george_language') || 'English'
  })

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const button = target?.closest('button') as HTMLButtonElement | null
      if (!button) return
      if (!window.location.pathname.startsWith('/george')) return

      const label = (button.textContent || '').trim()
      if (!LANGUAGE_OPTIONS.includes(label)) return

      setOpen((value) => !value)
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleKey)

    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-x-0 bottom-[124px] z-[260] flex justify-center px-4">
      <div className="w-full max-w-[260px] overflow-hidden rounded-[1.05rem] border border-white/[0.055] bg-[#07090E]/94 p-1.5 shadow-[0_18px_54px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        <div className="px-3 pb-1.5 pt-2 text-[10px] uppercase tracking-[0.2em] text-white/28">
          Language
        </div>

        <div className="grid gap-1">
          {LANGUAGE_OPTIONS.map((language) => {
            const active = current === language

            return (
              <button
                key={language}
                type="button"
                onClick={() => {
                  window.localStorage.setItem('george_language', language)
                  setCurrent(language)
                  setOpen(false)
                  window.location.reload()
                }}
                className={`flex items-center justify-between rounded-[0.8rem] px-3 py-2 text-left text-[13px] transition ${
                  active
                    ? 'bg-white/[0.035] text-white/74'
                    : 'text-white/44 hover:bg-white/[0.024] hover:text-white/70'
                }`}
              >
                <span>{language}</span>
                {active ? <span className="text-[11px] text-[#AEB6FF]/62">Active</span> : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
