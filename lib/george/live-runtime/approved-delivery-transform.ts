import type { GeorgeApprovedLiveDelivery } from './approved-delivery-history'

export type GeorgeApprovedDeliveryRewordChoice = 'natural'

const REWORD_DIRECTION: Record<
  GeorgeApprovedDeliveryRewordChoice,
  string
> = {
  natural: 'sound more natural',
}

export function buildGeorgeApprovedDeliveryRewordRequest(input: {
  delivery: GeorgeApprovedLiveDelivery
  choice: GeorgeApprovedDeliveryRewordChoice
}) {
  const text = String(input.delivery.text || '').trim()
  if (!text) return null

  return [
    `Reword this already-approved LIVE support to ${REWORD_DIRECTION[input.choice]}.`,
    'Preserve its meaning, desired outcome, operational intent, and factual boundaries.',
    'Do not add a new recommendation, assumption, or unsupported claim.',
    'Return only the reworded support.',
    '',
    text,
  ].join('\n')
}
