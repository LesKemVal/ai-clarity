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
    id: 'audio_only',
    label: 'Audio',
    line: 'Spoken support in your ear.',
    detail: 'Use earbuds or audio glasses when reading is not practical. GEORGE keeps spoken guidance sequential, repeatable, and low-cognitive-load.',
  },
  {
    id: 'audio_visual',
    label: 'Glasses',
    line: 'Readable guidance through supported glasses.',
    detail: 'Use supported text-capable glasses for discreet, in-view guidance. Audio may carry immediate steering while visual support remains available as readable reference.',
  },
  {
    id: 'visual_only',
    label: 'Desktop / Mobile',
    line: 'Readable support in the responsive web workspace.',
    detail: 'Use the desktop or mobile interface when the screen is your delivery surface. Visual guidance may be structured, persistent, skimmable, and richer than spoken delivery.',
  },
]
