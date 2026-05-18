'use client'

type LiveComposerBoundaryProps = {
  children: React.ReactNode
}

/**
 * LIVE composer extraction boundary.
 *
 * Purpose:
 * - keep /george/live UI from continuing to spread through app/george/page.tsx
 * - migrate LIVE-only composer controls here one piece at a time
 * - preserve GEORGE as the runtime brain while LIVE owns the in-room interface
 *
 * Do not move normal GEORGE composer behavior into this component.
 */
export default function LiveComposerBoundary({ children }: LiveComposerBoundaryProps) {
  return <>{children}</>
}
