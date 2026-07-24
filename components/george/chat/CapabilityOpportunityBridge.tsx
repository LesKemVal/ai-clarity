'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import CapabilityPill from './CapabilityPill'
import {
  detectCapabilityOpportunity,
  type CapabilityOpportunity,
} from '@/lib/george/capabilities/capability-opportunity'

const REMINDER_DELAY_MS = 18000

function setReactTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value'
  )?.set

  setter?.call(textarea, value)
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
  textarea.dispatchEvent(new Event('change', { bubbles: true }))
}

function submitThroughComposer(prompt: string) {
  const textareas = Array.from(
    document.querySelectorAll<HTMLTextAreaElement>('textarea')
  ).filter((textarea) => textarea.offsetParent !== null && !textarea.disabled)

  const textarea = textareas.at(-1)
  if (!textarea) return false

  textarea.focus()
  setReactTextareaValue(textarea, prompt)
  textarea.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true,
      cancelable: true,
    })
  )

  return true
}

function findLatestAssistantActionRow() {
  const copyButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
    .filter((button) => button.offsetParent !== null && button.textContent?.trim() === 'Copy')

  return copyButtons.at(-1)?.parentElement ?? null
}

function findActiveComposer() {
  const textareas = Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea'))
    .filter((textarea) => textarea.offsetParent !== null && !textarea.disabled)

  return textareas.at(-1) ?? null
}

export default function CapabilityOpportunityBridge() {
  const pathname = usePathname()
  const [opportunity, setOpportunity] = useState<CapabilityOpportunity | null>(null)
  const [phase, setPhase] = useState<'idle' | 'suggested' | 'reminder' | 'expanded' | 'accepted'>('idle')
  const [actionRow, setActionRow] = useState<HTMLElement | null>(null)
  const [composerHost, setComposerHost] = useState<HTMLElement | null>(null)
  const reminderTimerRef = useRef<number | null>(null)
  const acceptedOpportunityRef = useRef<string | null>(null)

  const enabled = pathname === '/george'

  useEffect(() => {
    if (!enabled) return

    const inspect = () => {
      setActionRow(findLatestAssistantActionRow())

      const textarea = findActiveComposer()
      setComposerHost(textarea?.parentElement ?? null)

      if (acceptedOpportunityRef.current) return

      const detected = detectCapabilityOpportunity(document.body.innerText)
      if (!detected) return

      setOpportunity((current) => current ?? detected)
      setPhase((current) => (current === 'idle' ? 'suggested' : current))
    }

    inspect()
    const observer = new MutationObserver(inspect)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })

    return () => observer.disconnect()
  }, [enabled])

  useEffect(() => {
    if (!enabled || phase !== 'suggested' || !opportunity) return

    if (reminderTimerRef.current) window.clearTimeout(reminderTimerRef.current)
    reminderTimerRef.current = window.setTimeout(() => {
      setPhase('reminder')
    }, REMINDER_DELAY_MS)

    return () => {
      if (reminderTimerRef.current) window.clearTimeout(reminderTimerRef.current)
    }
  }, [enabled, opportunity, phase])

  useEffect(() => {
    if (!enabled || !opportunity || !composerHost) return

    const textarea = composerHost.querySelector('textarea')
    if (!(textarea instanceof HTMLTextAreaElement)) return

    const originalPlaceholder = textarea.placeholder

    if (phase === 'reminder' && !textarea.value.trim()) {
      textarea.placeholder = opportunity.question
    }

    const handleFocus = () => {
      if (phase === 'reminder') setPhase('expanded')
    }

    const handleInput = () => {
      if (phase === 'expanded' && textarea.value.trim()) setPhase('reminder')
    }

    textarea.addEventListener('focus', handleFocus)
    textarea.addEventListener('input', handleInput)

    return () => {
      textarea.removeEventListener('focus', handleFocus)
      textarea.removeEventListener('input', handleInput)
      if (textarea.placeholder === opportunity.question) {
        textarea.placeholder = originalPlaceholder
      }
    }
  }, [composerHost, enabled, opportunity, phase])

  const accept = () => {
    if (!opportunity) return
    const submitted = submitThroughComposer(opportunity.activationPrompt)
    if (!submitted) return

    acceptedOpportunityRef.current = opportunity.id
    setPhase('accepted')
    window.setTimeout(() => {
      setOpportunity(null)
      setPhase('idle')
    }, 2000)
  }

  const pill = useMemo(() => {
    if (!actionRow || !opportunity || phase !== 'suggested') return null

    return createPortal(
      <CapabilityPill label={opportunity.label} visible onClick={accept} />,
      actionRow
    )
  }, [actionRow, opportunity, phase])

  const reminder = useMemo(() => {
    if (!composerHost || !opportunity || phase !== 'expanded') return null

    return createPortal(
      <button
        type="button"
        onClick={accept}
        className="absolute bottom-full left-3 mb-2 rounded-full border border-white/[0.08] bg-[#07090E]/94 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#D7DBE4]/62 shadow-[0_14px_40px_rgba(0,0,0,0.36)] transition hover:border-white/[0.14] hover:text-[#D7DBE4]/88"
        aria-label={`Connect ${opportunity.label} to this conversation`}
      >
        {opportunity.question}
      </button>,
      composerHost
    )
  }, [composerHost, opportunity, phase])

  if (!enabled) return null

  return (
    <>
      {pill}
      {reminder}
    </>
  )
}
