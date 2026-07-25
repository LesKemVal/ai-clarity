export type LivePreparationSignals = Record<string, string>

export type LivePreparationStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const LIVE_PREPARATION_STORAGE_KEYS = Object.freeze({
  signals: 'GEORGE_PRE_LIVE_SIGNALS',
  previewReady: 'GEORGE_PRE_LIVE_PREVIEW_READY',
})

export function loadLivePreparationSignals(
  storage: LivePreparationStorage
): LivePreparationSignals {
  try {
    const raw = storage.getItem(LIVE_PREPARATION_STORAGE_KEYS.signals)
    if (!raw) return {}

    const parsed = JSON.parse(raw)

    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      const normalized: LivePreparationSignals = {}

      for (const [key, value] of Object.entries(parsed)) {
        normalized[key] = String(value ?? '')
      }

      return normalized
    }

    return {}
  } catch {
    return {}
  }
}

export function saveLivePreparationSignals(
  storage: LivePreparationStorage,
  signals: LivePreparationSignals
): void {
  try {
    storage.setItem(
      LIVE_PREPARATION_STORAGE_KEYS.signals,
      JSON.stringify(signals)
    )
  } catch {}
}

export function clearLivePreparationSignals(
  storage: LivePreparationStorage
): void {
  try {
    storage.removeItem(LIVE_PREPARATION_STORAGE_KEYS.signals)
  } catch {}
}

export function isLivePreparationPreviewReady(
  storage: LivePreparationStorage
): boolean {
  try {
    return (
      storage.getItem(
        LIVE_PREPARATION_STORAGE_KEYS.previewReady
      ) === '1'
    )
  } catch {
    return false
  }
}

export function markLivePreparationPreviewReady(
  storage: LivePreparationStorage
): void {
  try {
    storage.setItem(
      LIVE_PREPARATION_STORAGE_KEYS.previewReady,
      '1'
    )
  } catch {}
}

export function clearLivePreparationPreviewReady(
  storage: LivePreparationStorage
): void {
  try {
    storage.removeItem(
      LIVE_PREPARATION_STORAGE_KEYS.previewReady
    )
  } catch {}
}
