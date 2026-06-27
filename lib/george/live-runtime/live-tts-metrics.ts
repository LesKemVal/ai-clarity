import { markRuntimeEvent, startRuntimeTurn } from '@/lib/george/live-metrics/runtime-metrics'

export function startLiveTtsTurn(turnId: string) {
  startRuntimeTurn(turnId)
}

export function markLiveTtsRequestStart(turnId?: string) {
  if (!turnId) return
  markRuntimeEvent(turnId, 'tts_request_start')
}

export function markLiveTtsAudioReceived(turnId?: string) {
  if (!turnId) return
  markRuntimeEvent(turnId, 'tts_audio_received')
}

export function markLiveTtsPlaybackStart(turnId?: string) {
  if (!turnId) return
  markRuntimeEvent(turnId, 'tts_playback_start')
}

export function markLiveTtsPlaybackEnd(turnId?: string) {
  if (!turnId) return
  markRuntimeEvent(turnId, 'tts_playback_end')
}
