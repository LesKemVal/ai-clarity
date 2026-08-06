import {
  clearPreparationSession as clearSession,
  clearLivePreparationPreviewReady as clearPreviewReady,
  clearLivePreparationSignals as clearSignals,
  isLivePreparationPreviewReady as readPreviewReady,
  loadPreparationSession as loadSession,
  loadLivePreparationSignals as loadSignals,
  markLivePreparationPreviewReady as markPreviewReady,
  savePreparationSession as saveSession,
  saveLivePreparationSignals as saveSignals,
  type LivePreparationSignals,
  type LivePreparationStorage,
} from '@/lib/george/live-runtime/live-preparation-storage'
import type { PreparationSessionV1 } from '@/lib/george/live-runtime/live-preparation-controller'

function getBrowserLivePreparationStorage(): LivePreparationStorage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export function loadPreparationSession(): PreparationSessionV1 | null {
  const storage = getBrowserLivePreparationStorage()
  return storage ? loadSession(storage) : null
}

export function savePreparationSession(
  session: PreparationSessionV1,
): void {
  const storage = getBrowserLivePreparationStorage()
  if (storage) saveSession(storage, session)
}

export function clearPreparationSession(): void {
  const storage = getBrowserLivePreparationStorage()
  if (storage) clearSession(storage)
}

export function loadLivePreparationSignals(): LivePreparationSignals {
  const storage = getBrowserLivePreparationStorage()
  return storage ? loadSignals(storage) : {}
}

export function saveLivePreparationSignals(
  signals: LivePreparationSignals
): void {
  const storage = getBrowserLivePreparationStorage()
  if (storage) saveSignals(storage, signals)
}

export function clearLivePreparationSignals(): void {
  const storage = getBrowserLivePreparationStorage()
  if (storage) clearSignals(storage)
}

export function isLivePreparationPreviewReady(): boolean {
  const storage = getBrowserLivePreparationStorage()
  return storage ? readPreviewReady(storage) : false
}

export function markLivePreparationPreviewReady(): void {
  const storage = getBrowserLivePreparationStorage()
  if (storage) markPreviewReady(storage)
}

export function clearLivePreparationPreviewReady(): void {
  const storage = getBrowserLivePreparationStorage()
  if (storage) clearPreviewReady(storage)
}
