import type { GeorgeDeliveryCue } from '../live-delivery/types'

export type GeorgeApprovedLiveDelivery = {
  text: string
  turnId?: string
  mode: GeorgeDeliveryCue['mode']
  source: GeorgeDeliveryCue['source']
  confidence: number
  priority: number
  committedAt: number
}

export type GeorgeApprovedDeliveryReplay = {
  delivery: GeorgeApprovedLiveDelivery
  reason: 'repeat' | 'reword'
}

type ApprovedDeliveryListener = (
  replay: GeorgeApprovedDeliveryReplay
) => void

let lastApprovedDelivery: GeorgeApprovedLiveDelivery | null = null
const replayListeners = new Set<ApprovedDeliveryListener>()

export function commitGeorgeApprovedLiveDelivery(
  cue: GeorgeDeliveryCue
): GeorgeApprovedLiveDelivery | null {
  const text = String(cue.text || '').trim()
  if (!text) return null

  lastApprovedDelivery = {
    text,
    turnId: cue.turnId,
    mode: cue.mode,
    source: cue.source,
    confidence: Number(cue.confidence || 0),
    priority: Number(cue.priority || 0),
    committedAt: Date.now(),
  }

  return lastApprovedDelivery
}

export function getLastGeorgeApprovedLiveDelivery() {
  return lastApprovedDelivery
}

export function subscribeGeorgeApprovedDeliveryReplay(
  listener: ApprovedDeliveryListener
) {
  replayListeners.add(listener)

  return () => {
    replayListeners.delete(listener)
  }
}

export function replayLastGeorgeApprovedLiveDelivery(
  reason: GeorgeApprovedDeliveryReplay['reason'] = 'repeat'
) {
  const delivery = lastApprovedDelivery
  if (!delivery) return null

  const replay = { delivery, reason } as const

  for (const listener of replayListeners) {
    listener(replay)
  }

  return delivery
}

export function clearGeorgeApprovedLiveDelivery() {
  lastApprovedDelivery = null
}
