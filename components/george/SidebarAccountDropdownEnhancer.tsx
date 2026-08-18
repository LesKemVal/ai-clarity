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
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<AnchorRect | null>(null)
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState('smart')
  const [authenticated, setAuthenticated] = useState(false)

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
  }, [])

  useEffect(() => {
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
  }, [])

  if (!open || !anchor) return null

  const top = Math.max(12, anchor.top + anchor.height + 8)
  const left = Math.max(12, anchor.left)
  const width = Math.max(224, Math.min(260, anchor.width))
  const label = authenticated ? 'Account Details' : 'Guest access'

  const actionRow =
    'block w-full rounded-[0.65rem] px-3 py-2 text-left text-[12px] text-white/58 transition hover:bg-white/[0.025] hover:text-white/82'

  return createPortal(
    <div
      data-bx-account-dropdown
      className="fixed z-[260] rounded-[1rem] border border-white/[0.055] bg-[#080A0E]/98 p-2 shadow-[0_18px_52px_rgba(0,0,0,0.44)] backdrop-blur-xl"
      style={{ top, left, width }}
    >
      <div className="rounded-[0.75rem] border border-white/[0.035] bg-white/[0.015] px-3 py-2.5">
        <div className="truncate text-[13px] font-medium tracking-[-0.01em] text-white/82">{label}</div>
        <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-white/28">{tier} access</div>
      </div>

      <div className="mt-1.5 space-y-0.5">
        <a href="/runtime" className={actionRow}>Dashboard / System</a>
        <a href="/top-up" className={actionRow}>Upgrade</a>
        <button
          type="button"
          className={actionRow}
          onClick={() => {
            setOpen(false)
            if (!clickSidebarLiveGate()) { window.localStorage.setItem('george_open_live_chooser_after_home', '1'); window.location.href = '/george' }
          }}
        >
          Enter LIVE
        </button>
        <a href="/signal" className={actionRow}>Personalization / Signal</a>
        <a href="/help" className={actionRow}>Help</a>
      </div>

      <div className="mt-1.5 border-t border-white/[0.045] pt-1.5">
        {authenticated ? (
          <button
            type="button"
            className={`${actionRow} text-white/42 hover:text-white/74`}
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
            className={`${actionRow} text-white/42 hover:text-white/74`}
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
