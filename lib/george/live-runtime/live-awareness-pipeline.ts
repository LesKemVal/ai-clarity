import {
  appendLiveAwarenessFragment,
  type LiveAwarenessFragment,
  type LiveAwarenessFragmentKind,
} from './live-awareness-buffer'
import { reconcileLiveAwareness } from './live-awareness-reconciliation'
import { recoverLiveOverlapContext } from './live-overlap-recovery'

export function processLiveAwarenessSignal(params: {
  buffer: LiveAwarenessFragment[]
  kind: LiveAwarenessFragmentKind
  text: string
  whileGeorgeSpeaking?: boolean
}) {
  const buffer = appendLiveAwarenessFragment({
    buffer: params.buffer,
    kind: params.kind,
    text: params.text,
    whileGeorgeSpeaking: params.whileGeorgeSpeaking,
  })

  const awarenessState = reconcileLiveAwareness(buffer)
  const overlapRecovery = recoverLiveOverlapContext(awarenessState)

  return {
    buffer,
    awarenessState,
    overlapRecovery,
  }
}
