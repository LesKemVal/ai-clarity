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
    label: 'Guidance',
    line: 'Adaptive support delivered at the right moment.',
    detail: 'Guidance is adaptive internally. GEORGE uses the least intrusive support that can meaningfully improve the outcome: cue, question, short phrase, timing adjustment, continuation, response, or posture reminder.',
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
