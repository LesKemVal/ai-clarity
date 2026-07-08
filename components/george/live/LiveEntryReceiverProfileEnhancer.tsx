'use client'

import { useEffect } from 'react'
type GeorgeLiveReceiverProfile = 'visual_only' | 'audio_only' | 'audio_visual'

const GEORGE_LIVE_RECEIVER_PROFILE_KEY = 'george_live_entry_support_preference'

function normalizeGeorgeLiveReceiverProfile(value: unknown): GeorgeLiveReceiverProfile | null {
  return value === 'visual_only' || value === 'audio_only' || value === 'audio_visual'
    ? value
    : null
}

function getGeorgeLiveReceiverProfileLabel(profile: GeorgeLiveReceiverProfile) {
  if (profile === 'audio_only') return 'Audio'
  if (profile === 'audio_visual') return 'Audio + Visual'
  return 'Visual'
}

const receiverProfiles: Array<{
  id: GeorgeLiveReceiverProfile
  label: string
  line: string
}> = [
  { id: 'visual_only', label: 'Visual', line: 'Readable support on screen only.' },
  { id: 'audio_only', label: 'Audio', line: 'Spoken support in your ear only.' },
  { id: 'audio_visual', label: 'Audio + Visual', line: 'Spoken steering plus readable reference.' },
]

function readReceiverProfile() {
  if (typeof window === 'undefined') return 'visual_only' as GeorgeLiveReceiverProfile

  return (
    normalizeGeorgeLiveReceiverProfile(window.localStorage.getItem(GEORGE_LIVE_RECEIVER_PROFILE_KEY)) ||
    normalizeGeorgeLiveReceiverProfile(window.localStorage.getItem('GEORGE_LIVE_RECEIVER_PROFILE')) ||
    'visual_only'
  )
}

function persistReceiverProfile(profile: GeorgeLiveReceiverProfile) {
  window.localStorage.setItem(GEORGE_LIVE_RECEIVER_PROFILE_KEY, profile)
  window.localStorage.setItem('GEORGE_LIVE_RECEIVER_PROFILE', profile)
  window.dispatchEvent(new Event('george-live-receiver-profile-change'))
}

function findMechanicsContainer() {
  const sections = Array.from(document.querySelectorAll('section')) as HTMLElement[]
  const mechanicsSection = sections.find((section) =>
    section.textContent?.includes('BRIEF ROOM · MECHANICS') ||
    section.textContent?.includes('Mechanics')
  )

  if (!mechanicsSection) return null

  const candidates = Array.from(mechanicsSection.querySelectorAll('div')) as HTMLElement[]
  return candidates.find((div) => div.classList.contains('space-y-3')) || null
}

function topLevelCardFor(container: HTMLElement, node: HTMLElement) {
  let card: HTMLElement | null = node
  while (card && card.parentElement !== container) card = card.parentElement
  return card
}

function hideLegacyGuidance(container: HTMLElement) {
  const nodes = Array.from(container.querySelectorAll('div,button')) as HTMLElement[]

  nodes.forEach((node) => {
    const text = node.textContent || ''
    const legacyGuidance =
      text.includes('Support selected') ||
      text.includes('Guidance') ||
      text.includes("Here's how I can support you") ||
      text.includes('What I can do here')

    if (!legacyGuidance) return

    const card = topLevelCardFor(container, node)
    if (!card) return
    if (card.getAttribute('data-george-receiver-profile-card') === 'true') return
    if (card.textContent?.includes('Communication')) return
    if (card.textContent?.includes('Speaking Style')) return

    card.style.display = 'none'
    card.setAttribute('data-george-legacy-guidance-hidden', 'true')
  })
}

function renderReceiverCard(container: HTMLElement) {
  const existing = container.querySelector('[data-george-receiver-profile-card]') as HTMLElement | null
  const selected = readReceiverProfile()
  const selectedLabel = getGeorgeLiveReceiverProfileLabel(selected)

  const card = existing || document.createElement('div')
  card.setAttribute('data-george-receiver-profile-card', 'true')
  card.className = 'rounded-[0.82rem] border border-emerald-300/[0.16] bg-emerald-300/[0.045] px-4 py-3'

  card.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="text-[9px] uppercase tracking-[0.24em] text-emerald-100/46">Receiver selected</div>
        <div class="mt-2 text-[14px] font-semibold text-[#F2F4FF]/88">${selectedLabel}</div>
        <div class="mt-1 text-[11px] leading-5 text-[#D7DBE4]/50">Tell GEORGE how you will receive support. Guidance stays adaptive internally.</div>
      </div>
    </div>
    <div class="mt-4 grid gap-2 sm:grid-cols-3">
      ${receiverProfiles.map((profile) => {
        const active = profile.id === selected
        return `
          <button
            type="button"
            data-george-receiver-profile="${profile.id}"
            class="rounded-[0.72rem] border px-3 py-2.5 text-left transition ${
              active
                ? 'border-emerald-300/[0.24] bg-emerald-300/[0.055]'
                : 'border-white/[0.06] bg-white/[0.018] hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035]'
            }"
          >
            <span class="block text-[11px] font-semibold text-[#F2F4FF]/78">${profile.label}</span>
            <span class="mt-1 block text-[10px] leading-4 text-white/36">${profile.line}</span>
          </button>
        `
      }).join('')}
    </div>
  `

  card.querySelectorAll('[data-george-receiver-profile]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = normalizeGeorgeLiveReceiverProfile(button.getAttribute('data-george-receiver-profile'))
      if (!next) return
      persistReceiverProfile(next)
      renderReceiverCard(container)
    })
  })

  if (!existing) container.insertBefore(card, container.firstChild)
}

function renderBackControl() {
  const sections = Array.from(document.querySelectorAll('section')) as HTMLElement[]
  sections.forEach((section) => {
    if (!section.textContent?.includes('BRIEF ROOM')) return
    if (section.querySelector('[data-george-live-entry-back]')) return

    const stepBadge = Array.from(section.querySelectorAll('div')).find((div) =>
      /^Step\s+[123]$/i.test((div.textContent || '').trim())
    ) as HTMLElement | undefined

    const target = stepBadge?.parentElement
    if (!target) return

    const back = document.createElement('button')
    back.type = 'button'
    back.setAttribute('data-george-live-entry-back', 'true')
    back.className = 'rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-white/36 transition hover:border-[#D7DCFF]/18 hover:text-[#D7DCFF]/72'
    back.textContent = 'Back'
    back.addEventListener('click', () => window.history.back())

    target.insertBefore(back, stepBadge)
  })
}

export default function LiveEntryReceiverProfileEnhancer() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const enhance = () => {
      if (!window.location.pathname.includes('/george/live-entry')) return

      renderBackControl()

      const container = findMechanicsContainer()
      if (!container) return

      hideLegacyGuidance(container)
      renderReceiverCard(container)
    }

    enhance()

    const observer = new MutationObserver(enhance)
    observer.observe(document.body, { childList: true, subtree: true })

    const interval = window.setInterval(enhance, 500)

    return () => {
      observer.disconnect()
      window.clearInterval(interval)
    }
  }, [])

  return null
}
