'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { fetchGeorgeSessionAuthority } from '@/lib/george/session-authority'

type AnchorRect = {
  top: number
  left: number
  width: number
  height: number
}

function findAccountCard(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  const aside = document.querySelector('aside[class*="w-[258px]"]')
  if (!aside) return null

  return aside.querySelector('div[class*="rounded-[1rem]"][class*="bg-black/24"]') as HTMLElement | null
}

function clickExistingAccountAction(match: RegExp) {
  const card = findAccountCard()
  if (!card) return false

  const controls = Array.from(card.querySelectorAll('a, button')) as Array<HTMLAnchorElement | HTMLButtonElement>
  const target = controls.find((control) => match.test((control.textContent || '').trim()))
  if (!target) return false
  target.click()
  return true
}

function clickSidebarLiveGate() {
  if (typeof document === 'undefined') return false
  const aside = document.querySelector('aside[class*="w-[258px]"]')
  if (!aside) return false

  const controls = Array.from(aside.querySelectorAll('button')) as HTMLButtonElement[]
  const target = controls.find((control) => (control.textContent || '').trim().toLowerCase() === 'live')
  if (!target) return false
  target.click()
  return true
}

function maskEmail(value: string) {
  const [name, domain] = value.split('@')
  if (!name || !domain) return 'Account Details'
  const visible = name.slice(0, 2)
  return `${visible}••••@${domain}`
}

export default function SidebarAccountDropdownEnhancer() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<AnchorRect | null>(null)
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState('smart')
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchGeorgeSessionAuthority()
      .then((authority) => {
        if (cancelled) return
        setEmail(authority.email || '')
        setTier(authority.tier || 'smart')
        setAuthenticated(!!authority.authenticated)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!mounted) return

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const card = findAccountCard()
      if (!card || !target) return

      if (card.contains(target)) {
        event.preventDefault()
        event.stopPropagation()

        const rect = card.getBoundingClientRect()
        setAnchor({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
        setOpen((value) => !value)
        return
      }

      if (!target.closest('[data-bx-account-dropdown]')) {
        setOpen(false)
      }
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    const card = findAccountCard()
    if (!card) return

    card.setAttribute('data-bx-account-trigger', 'true')
    card.setAttribute('role', 'button')
    card.setAttribute('tabindex', '0')
    card.setAttribute('aria-label', 'Open account menu')

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      const rect = card.getBoundingClientRect()
      setAnchor({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
      setOpen((value) => !value)
    }

    card.addEventListener('keydown', onKeyDown)
    return () => card.removeEventListener('keydown', onKeyDown)
  }, [mounted])

  if (!mounted || !open || !anchor) return null

  const top = Math.max(12, anchor.top + anchor.height + 8)
  const left = Math.max(12, anchor.left)
  const width = Math.max(224, Math.min(260, anchor.width))
  const label = authenticated ? 'Account Details' : 'Guest access'

  const actionRow =
    'block w-full rounded-[0.78rem] px-3 py-2.5 text-left text-[13px] text-white/76 transition hover:bg-white/[0.06] hover:text-white'

  return createPortal(
    <div
      data-bx-account-dropdown
      className="fixed z-[260] rounded-[1rem] border border-white/[0.075] bg-[#07090E]/95 p-2 shadow-[0_24px_72px_rgba(0,0,0,0.58)] backdrop-blur-[18px]"
      style={{ top, left, width }}
    >
      <div className="rounded-[0.85rem] border border-white/[0.05] bg-white/[0.025] px-3 py-3">
        <div className="truncate text-[13px] font-semibold tracking-[-0.02em] text-white/90">{label}</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/38">{tier} access</div>
      </div>

      <div className="mt-2 space-y-1">
        <a href="/runtime" className={actionRow}>Dashboard / System</a>
        <a href="/top-up" className={actionRow}>Upgrade</a>
        <button
          type="button"
          className={actionRow}
          onClick={() => {
            setOpen(false)
            if (!clickSidebarLiveGate()) window.location.href = '/george/live-entry'
          }}
        >
          Enter LIVE
        </button>
        <a href="/signal" className={actionRow}>Personalization / Signal</a>
        <a href="/help" className={actionRow}>Help</a>
      </div>

      <div className="mt-2 border-t border-white/[0.07] pt-2">
        {authenticated ? (
          <button
            type="button"
            className={`${actionRow} text-white/58 hover:text-white`}
            onClick={() => {
              setOpen(false)
              if (!clickExistingAccountAction(/exit|log\s*out|logout/i)) {
                window.location.href = '/george'
              }
            }}
          >
            Log out
          </button>
        ) : (
          <button
            type="button"
            className={`${actionRow} text-white/58 hover:text-white`}
            onClick={() => {
              setOpen(false)
              if (!clickExistingAccountAction(/continue|sign\s*in|login/i)) {
                window.location.href = '/george'
              }
            }}
          >
            Sign in
          </button>
        )}
      </div>
    </div>,
    document.body
  )
}
