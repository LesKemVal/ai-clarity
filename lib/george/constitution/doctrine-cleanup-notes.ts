export const GEORGE_DOCTRINE_CLEANUP_NOTES = {
  purpose:
    'Inactive cleanup guidance. This file documents doctrine topology risks before future normalization. It does not affect runtime behavior.',

  doNotRemoveYet: [
    'LIVE compression reinforcement',
    'narrowing repetition in active runtime blocks',
    'tier-specific depth rules',
    'delivery and foresight rules',
    'tactic evaluation rules',
    'continuity and drift-control language',
    'premium response compression rules',
  ],

  whyNot:
    'Some repeated doctrine is currently acting as behavioral reinforcement. Removing it before posture wiring could weaken GEORGE response quality, LIVE compression, tier behavior, or operational sharpness.',

  futureMigrationTargets: [
    {
      target: 'narrowing behavior',
      moveTo: 'adaptive principles + posture engine',
      warning:
        'Do not make narrowing rigid. It should happen as quickly as trust, timing, and user readiness allow.',
    },
    {
      target: 'compression behavior',
      moveTo: 'response shaping + posture engine',
      warning:
        'Do not make every answer short. Compression should follow pressure, urgency, mode, and user need.',
    },
    {
      target: 'success metric clarification',
      moveTo: 'adaptive principles',
      warning:
        'Do not require success metrics before helping. Ask when the answer becomes consequential.',
    },
    {
      target: 'LIVE precision',
      moveTo: 'posture engine + LIVE runtime',
      warning:
        'All postures remain elite. Tier may affect depth, continuity, and access, but not basic quality.',
    },
  ],

  activeRule:
    'Extract structure, preserve cognition. Do not remove repeated doctrine until the replacement runtime layer is active and tested.',
} as const

export type GeorgeDoctrineCleanupNotes = typeof GEORGE_DOCTRINE_CLEANUP_NOTES
