import type { CurrentGeorgeRuntime } from '@/lib/george/chat/current-runtime-policy'

export type GeorgeOutputFormat =
  | 'direct'
  | 'say_backup_cue'
  | 'word_say_cue_need'
  | 'next_move_only'

export type GeorgeOutputGovernance = {
  format: GeorgeOutputFormat
  maxSections: number
  sectionRules: string[]
  stopRule: string
  avoid: string[]
}

export function getOutputGovernance(input: {
  runtime: CurrentGeorgeRuntime
  pressureLevel?: string
  voiceMode?: boolean
}) {
  const pressure = String(input.pressureLevel || 'low').toLowerCase()
  const highPressure = pressure === 'high' || pressure === 'medium'

  if (input.runtime === 'live_george') {
    if (input.voiceMode) {
      return {
        format: 'next_move_only',
        maxSections: 1,
        sectionRules: [
          'Give only the next move unless the user asks for exact words.',
          'Keep audio responses extremely short and speakable.',
          'Use silence or [PAUSE] when restraint is stronger than speaking.',
        ],
        stopRule: 'After the next move, stop and wait for the next signal.',
        avoid: [
          'multi-step coaching',
          'explanatory framing',
          'generic reassurance',
        ],
      } satisfies GeorgeOutputGovernance
    }

    return {
      format: highPressure ? 'say_backup_cue' : 'word_say_cue_need',
      maxSections: highPressure ? 3 : 4,
      sectionRules: [
        'Say is the strongest usable line right now.',
        'Backup is the fallback if resistance appears.',
        'Cue is emotional calibration, pacing, restraint, or leverage reminder.',
        'Need is only used when one missing signal is required.',
      ],
      stopRule: 'Do not solve the entire conversation; answer the current room moment.',
      avoid: [
        'long scripts unless requested',
        'prep lists during live pressure',
        'assistant-style explanation',
      ],
    } satisfies GeorgeOutputGovernance
  }

  return {
    format: 'direct',
    maxSections: highPressure ? 3 : 5,
    sectionRules: [
      'Name the target when useful.',
      'Name the pressure or tradeoff when it matters.',
      'Give the strongest path or next move.',
      'Ask one leverage question only when needed.',
    ],
    stopRule: 'Stop when the answer gives the user a real next move.',
    avoid: [
      'unnecessary menus',
      'therapy framing',
      'generic chatbot endings',
      'over-explaining after the target is clear',
    ],
  } satisfies GeorgeOutputGovernance
}

export function buildOutputGovernanceNote(governance: GeorgeOutputGovernance) {
  return `
OUTPUT GOVERNANCE
- Format: ${governance.format}
- Max sections: ${governance.maxSections}
- Section rules: ${governance.sectionRules.join(' ')}
- Stop rule: ${governance.stopRule}
- Avoid: ${governance.avoid.join(', ')}
`.trim()
}
