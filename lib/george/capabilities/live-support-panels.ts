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
    label: 'Cue',
    line: 'Concise advice about what to do or say next.',
    detail:
      'GEORGE starts with the shortest useful cue. When current signals show that a cue is not enough, the governed runtime may provide more explicit help without changing the approved move.',
  },
  {
    id: 'response',
    label: 'Lines',
    line: 'Directly usable speech in your voice.',
    detail:
      'GEORGE starts with the shortest complete line that can accomplish the approved move. If lines are working, GEORGE keeps them concise. Existing governed runtime evidence may still select a cue, continuation, recovery, or another operational resource when it would serve you better.',
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
