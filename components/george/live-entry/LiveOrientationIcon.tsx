export type LiveOrientationIconKind =
  | 'conversation'
  | 'reading'
  | 'repeat'
  | 'support'
  | 'pause'
  | 'audio'

export function LiveOrientationIcon({ kind }: { kind: LiveOrientationIconKind }) {
  if (kind === 'conversation') {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" aria-hidden="true">
        <path d="M9 12h24a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H22l-8 6v-6H9a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6Z" fill="currentColor" opacity=".88" />
        <path d="M15 21h13M15 27h9" stroke="#071016" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'reading') {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" aria-hidden="true">
        <path d="M8 10h13a5 5 0 0 1 5 5v23H13a5 5 0 0 0-5 5V10Z" fill="currentColor" opacity=".82" />
        <path d="M40 10H27a5 5 0 0 0-5 5v23h13a5 5 0 0 1 5 5V10Z" fill="currentColor" opacity=".62" />
        <path d="M13 18h8M13 24h8M28 18h7M28 24h7" stroke="#071016" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'repeat') {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M36 17a15 15 0 1 0 1 15" />
        <path d="m32 8 5 9-10 1" />
      </svg>
    )
  }

  if (kind === 'support') {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" aria-hidden="true">
        <rect x="7" y="10" width="34" height="7" rx="3.5" fill="currentColor" opacity=".92" />
        <rect x="11" y="21" width="27" height="7" rx="3.5" fill="currentColor" opacity=".68" />
        <rect x="15" y="32" width="19" height="7" rx="3.5" fill="currentColor" opacity=".46" />
      </svg>
    )
  }

  if (kind === 'pause') {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9" fill="currentColor" aria-hidden="true">
        <rect x="10" y="8" width="10" height="32" rx="4" />
        <rect x="28" y="8" width="10" height="32" rx="4" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" aria-hidden="true">
      <path d="M24 29a8 8 0 0 0 8-8v-6a8 8 0 1 0-16 0v6a8 8 0 0 0 8 8Z" />
      <path d="M10 22a14 14 0 0 0 28 0M24 36v7" />
    </svg>
  )
}
