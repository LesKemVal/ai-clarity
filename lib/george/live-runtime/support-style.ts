export type LiveSupportStyle =
  | 'cue'
  | 'continue'
  | 'response'
  | 'presentation'

export type CueDepth =
  | 'brief'
  | 'tactical'
  | 'advisory'
  | 'extended'

export type LegacyLiveAssistMode = 'cues' | 'lines'

export function normalizeLiveSupportStyle(
  value: unknown,
  fallback: LiveSupportStyle = 'cue'
): LiveSupportStyle {
  const clean = String(value || '').trim()

  if (clean === 'cue' || clean === 'cues' || clean === 'advice') return 'cue'
  if (clean === 'continue' || clean === 'line' || clean === 'lines') return 'continue'
  if (clean === 'response') return 'response'
  if (clean === 'presentation' || clean === 'expandedLine') return 'presentation'

  return fallback
}

export function legacyAssistModeFromSupportStyle(
  style: LiveSupportStyle
): LegacyLiveAssistMode {
  return style === 'continue' ? 'lines' : 'cues'
}

export function isCueSupportStyle(value: unknown) {
  return normalizeLiveSupportStyle(value) === 'cue'
}
