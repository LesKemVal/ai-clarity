/**
 * Neutral LIVE transport and delivery contracts.
 *
 * This file contains shared types only. It owns no runtime behavior,
 * reasoning, routing, rendering, or delivery decisions.
 */
export type GeorgeLiveDeliveryStyle =
  | 'silent'
  | 'cue'
  | 'advice'
  | 'line'
  | 'response'
  | 'expandedLine'
  | 'continue'
