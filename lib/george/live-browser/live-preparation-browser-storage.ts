import {
  clearLivePreparationPreviewReady as clearPreviewReady,
  clearLivePreparationSignals as clearSignals,
  isLivePreparationPreviewReady as readPreviewReady,
  loadLivePreparationSignals as loadSignals,
  markLivePreparationPreviewReady as markPreviewReady,
  saveLivePreparationSignals as saveSignals,
  type LivePreparationSignals,
  type LivePreparationStorage,
} from '@/lib/george/live-runtime/live-preparation-storage'

function getBrowserLivePreparationStorage(): LivePreparationStorage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
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
