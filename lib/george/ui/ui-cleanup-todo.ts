export const GEORGE_UI_CLEANUP_TODO = {
  purpose:
    'Deferred UI/logic cleanup notes. This file is inactive and does not affect runtime behavior.',

  messageControls: [
    {
      item: 'Legacy response buttons',
      note: 'Audit buttons beneath GEORGE responses. Some belong to an earlier version of GEORGE and may now be obsolete.',
    },
    {
      item: 'Simplify button',
      note: 'Review whether Simplify still belongs in the current GEORGE control model or should be replaced by a newer action.',
    },
    {
      item: 'See more / See less',
      note: 'Only show when appropriate based on actual content overflow or collapsed long response state.',
    },
  ],

  readingAndScrollSignals: [
    {
      item: 'More text below indicator',
      note: 'Add a low-opacity, glassy circular indicator with a downward arrow when more response text exists below the visible area.',
    },
    {
      item: 'Rendering activity signal',
      note: 'Use the three-button/control area motion to indicate text is still rendering, without creating visual clutter.',
    },
  ],

  liveExitContinuity: [
    {
      item: 'Exit LIVE returns to normal GEORGE state',
      note: 'When user exits LIVE, restore last known active normal GEORGE session/state, even if the session was unsaved.',
    },
    {
      item: 'Cross-session context awareness',
      note: 'Keep GEORGE context-aware across sessions without showing unnecessary continuity messages.',
    },
  ],

  activeRule:
    'Do not address these during runtime governance work unless specifically switching to UI cleanup. Preserve current architecture direction first.',
} as const

export type GeorgeUiCleanupTodo = typeof GEORGE_UI_CLEANUP_TODO
