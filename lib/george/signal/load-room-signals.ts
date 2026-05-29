import type { SignalRoom, SavedRoomSignal } from './room-signal-options'

const ROOM_SIGNAL_STORAGE_KEY = 'GEORGE_ROOM_SIGNALS'

export function loadRoomSignals(room?: string): SavedRoomSignal[] {
  if (typeof window === 'undefined') return []

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(ROOM_SIGNAL_STORAGE_KEY) || '[]'
    )

    if (!Array.isArray(parsed)) return []

    if (!room) return parsed

    return parsed.filter(
      (signal) =>
        signal &&
        typeof signal === 'object' &&
        signal.room === room
    )
  } catch {
    return []
  }
}
