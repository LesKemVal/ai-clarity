import { markRuntimeEvent, startRuntimeTurn } from '@/lib/george/live-metrics/runtime-metrics'

const ttsTurnAliases = new Map<string, string>()
let pendingHubVoiceTurnId: string | undefined

function cleanTurnId(turnId?: string) {
  return String(turnId || '').trim() || undefined
}

function resolveLiveTtsTurnId(turnId?: string) {
  const clean = cleanTurnId(turnId)
  if (!clean) return undefined
  return ttsTurnAliases.get(clean) || clean
}

export function claimLiveHubVoiceTurn(turnId?: string) {
  pendingHubVoiceTurnId = cleanTurnId(turnId)
}

export function startLiveTtsTurn(turnId: string) {
  const clean = cleanTurnId(turnId)
  if (!clean) return

  if (pendingHubVoiceTurnId) {
    ttsTurnAliases.set(clean, pendingHubVoiceTurnId)
    pendingHubVoiceTurnId = undefined
    return
  }

  startRuntimeTurn(clean)
}

export function markLiveTtsRequestStart(turnId?: string) {
  const resolvedTurnId = resolveLiveTtsTurnId(turnId)
  if (!resolvedTurnId) return
  markRuntimeEvent(resolvedTurnId, 'tts_request_start')
}

export function markLiveTtsAudioReceived(turnId?: string) {
  const resolvedTurnId = resolveLiveTtsTurnId(turnId)
  if (!resolvedTurnId) return
  markRuntimeEvent(resolvedTurnId, 'tts_audio_received')
}

export function markLiveTtsPlaybackStart(turnId?: string) {
  const resolvedTurnId = resolveLiveTtsTurnId(turnId)
  if (!resolvedTurnId) return
  markRuntimeEvent(resolvedTurnId, 'tts_playback_start')
}

export function markLiveTtsPlaybackEnd(turnId?: string) {
  const resolvedTurnId = resolveLiveTtsTurnId(turnId)
  if (!resolvedTurnId) return
  markRuntimeEvent(resolvedTurnId, 'tts_playback_end')

  const clean = cleanTurnId(turnId)
  if (clean) ttsTurnAliases.delete(clean)
}
