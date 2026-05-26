export const PRO_LIVE_BOUNDARY = {
  status: 'shelved',
  currentRuntime: 'individual_live',
  doctrine:
    'Pro LIVE campaign and firm-mode logic is intentionally shelved. Current GEORGE runtime supports normal GEORGE and individual LIVE GEORGE only.',
  preserveForLater: [
    'telephone and service operator support',
    'professional conversation assistance',
    'structured intake for future team workflows',
    'compliance-aware scripting where appropriate',
  ],
  reusablePrimitives: [
    'pressure handling',
    'objection detection',
    'tone and cadence control',
    'gatekeeper dynamics',
    'response shaping',
    'next-move guidance',
    'follow-up intelligence',
    'room-reading',
  ],
  excludedFromCurrentRuntime: [
    'firm-mode assumptions',
    'CRM-style campaign entities',
    'sales-pipeline governance',
    'corporate hierarchy defaults',
    'call-center management workflows',
  ],
} as const

export function isProLiveShelved() {
  return PRO_LIVE_BOUNDARY.status === 'shelved'
}

export function shouldUseCampaignRuntime() {
  return false
}
