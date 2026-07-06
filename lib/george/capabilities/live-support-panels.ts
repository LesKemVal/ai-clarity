export type LiveBriefingSupportPanelId =
  | 'advice'
  | 'completion'
  | 'response'
  | 'presentation'
  | 'steering'

export type LiveSupportPanel = {
  id: LiveBriefingSupportPanelId
  label: string
  line: string
  detail: string
}

export const LIVE_SUPPORT_PANELS: LiveSupportPanel[] = [
  {
    id: 'advice',
    label: 'Cue',
    line: 'Adaptive support delivered at the right moment.',
    detail: 'I use the least intrusive support that can meaningfully improve your chances of success. That may be a cue, question, short phrase, timing adjustment, or posture reminder.',
  },
  {
    id: 'completion',
    label: 'Continuation',
    line: 'I help preserve your trajectory.',
    detail: 'Start your thought naturally. When the conversation benefits from support, I\'ll help while preserving your objective.',
  },
  {
    id: 'response',
    label: 'Response',
    line: 'I provide a complete response.',
    detail: 'Useful when questions, objections, pressure, or unfamiliar topics require more than a cue. I provide a complete response you can use, revise, shorten, ignore, or reword.',
  },
  {
    id: 'presentation',
    label: 'Presentation',
    line: 'I help structure and deliver longer information.',
    detail: 'Useful when the room requires structured explanation, sequence, framing, or delivery. I help organize information without replacing your judgment or responsibility.',
  },
]
