export type LiveBriefingSupportPanelId =
  | 'advice'
  | 'completion'
  | 'response'
  | 'presentation'
  | 'steering'

export type LiveReceiverProfilePanelId =
  | 'visual_only'
  | 'audio_only'
  | 'audio_visual'

export type LiveSupportPanel = {
  id: LiveBriefingSupportPanelId
  label: string
  line: string
  detail: string
}

export type LiveReceiverProfilePanel = {
  id: LiveReceiverProfilePanelId
  label: string
  line: string
  detail: string
}

export const LIVE_SUPPORT_PANELS: LiveSupportPanel[] = [
  {
    id: 'advice',
    label: 'Adaptive Cue',
    line: 'Recommended. Begin with concise cues.',
    detail:
      'GEORGE starts with the shortest useful guidance likely to help you reach your desired outcome. GEORGE adapts when a cue alone is not enough for successful execution.',
  },
  {
    id: 'response',
    label: 'Adaptive Response',
    line: 'Begin with concise, complete responses.',
    detail:
      'GEORGE starts with the shortest complete response you can use naturally. If complete lines are working, GEORGE leaves them alone. GEORGE may adapt to cues, continuation, recovery, or another operational resource when evidence suggests it would serve you better.',
  },
]

export const LIVE_RECEIVER_PROFILE_PANELS: LiveReceiverProfilePanel[] = [
  {
    id: 'visual_only',
    label: 'Visual',
    line: 'Readable support on screen only.',
    detail: 'Use this when you can glance at GEORGE. Visual support may be richer, structured, persistent, and skimmable.',
  },
  {
    id: 'audio_only',
    label: 'Audio',
    line: 'Spoken support in your ear only.',
    detail: 'Use this when you cannot safely read. Audio support stays sequential, repeatable, and low-cognitive-load where useful.',
  },
  {
    id: 'audio_visual',
    label: 'Audio + Visual',
    line: 'Spoken steering plus readable reference.',
    detail: 'Use this when you have both earbuds and a readable surface. Audio is immediate steering. Visual is persistent reference.',
  },
]
