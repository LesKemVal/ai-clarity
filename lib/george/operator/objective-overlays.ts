export type OperatorOverlay = {
  code: string
  title: string
  objective: string
  priorities: string[]
  targetTypes: string[]
  guidanceBias: string[]
}

export const OPERATOR_OVERLAYS: Record<string, OperatorOverlay> = {
  GRASSROOTS: {
    code: 'GRASSROOTS',
    title: 'Grassroots Adoption',
    objective:
      'Help the user expand GEORGE through local trust, demonstrations, communities, and real-world usefulness.',
    priorities: ['community trust', 'live usefulness', 'relationship continuity', 'local adoption', 'demonstrations'],
    targetTypes: ['churches', 'job centers', 'community leaders', 'small businesses', 'workforce groups', 'veterans groups', 'senior groups'],
    guidanceBias: ['field demonstrations', 'practical usefulness', 'trust-building', 'human relationships', 'operational continuity'],
  },

  EDU_OUTREACH: {
    code: 'EDU_OUTREACH',
    title: 'Education Outreach',
    objective:
      'Help the user identify educational institutions, workforce systems, and learning communities that could benefit from GEORGE.',
    priorities: ['institutional trust', 'student usefulness', 'communication improvement', 'continuity support'],
    targetTypes: ['schools', 'universities', 'community colleges', 'workforce programs', 'libraries', 'student organizations'],
    guidanceBias: ['structured communication', 'adoption pathways', 'institutional positioning', 'community usefulness'],
  },

  MEDIA_SPREAD: {
    code: 'MEDIA_SPREAD',
    title: 'Media Distribution',
    objective:
      'Help the user increase GEORGE awareness through podcasts, creators, interviews, demonstrations, and social distribution.',
    priorities: ['storytelling', 'demonstrations', 'creator partnerships', 'social proof', 'public trust'],
    targetTypes: ['podcasts', 'influencers', 'YouTube creators', 'interview channels', 'journalists', 'media organizations'],
    guidanceBias: ['clear positioning', 'demonstration strategy', 'audience fit', 'distribution leverage'],
  },

  ENTERPRISE: {
    code: 'ENTERPRISE',
    title: 'Institutional Expansion',
    objective:
      'Help the user position GEORGE for organizations, cities, nonprofits, and operational systems.',
    priorities: ['institutional utility', 'continuity', 'scalability', 'trust', 'operational deployment'],
    targetTypes: ['cities', 'nonprofits', 'church networks', 'health systems', 'workforce systems', 'organizations'],
    guidanceBias: ['system utility', 'deployment readiness', 'organizational trust', 'large-scale usefulness'],
  },
}

export function resolveOperatorOverlay(code?: string | null) {
  if (!code) return null
  return OPERATOR_OVERLAYS[code.trim().toUpperCase()] || null
}
