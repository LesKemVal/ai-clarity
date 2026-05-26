import type { CurrentGeorgeRuntime } from '@/lib/george/chat/current-runtime-policy'
import type { LiveContextPrimitive } from '@/lib/george/chat/live-context'
import type { GeorgeRuntimeAdapter } from '@/lib/george/runtime/runtime-adapter'

// Response shaping owns behavioral posture: how GEORGE should carry itself.
// Output governance owns visible answer structure: sections, stop rules, and formatting.
// Keep these separate unless a future consolidation is deliberately planned.
export type GeorgeResponseShape = {
  runtime: CurrentGeorgeRuntime
  maxSentences: number
  defaultFormat: 'direct' | 'say_backup_cue' | 'word_say_cue_need'
  posture: string
  avoid: string[]
  prefer: string[]
}

export function getCurrentResponseShape(input: {
  runtime: CurrentGeorgeRuntime
  pressureLevel?: string
  liveContext?: LiveContextPrimitive | null
  voiceMode?: boolean
  runtimeAdapter?: GeorgeRuntimeAdapter | null
}): GeorgeResponseShape {
  const pressure = String(input.pressureLevel || 'low').toLowerCase()
  const highPressure = pressure === 'high' || pressure === 'medium'
  const adapter = input.runtimeAdapter || null
  const adapterCompression = adapter?.shouldCompress || adapter?.responseMode === 'compressed' || adapter?.responseMode === 'live'
  const adapterLivePressure = adapter?.livePressure || adapter?.responseMode === 'live'

  if (input.runtime === 'live_george') {
    return {
      runtime: input.runtime,
      maxSentences: input.voiceMode ? 2 : adapterLivePressure ? 2 : highPressure || adapterCompression ? 3 : 4,
      defaultFormat: highPressure || adapterLivePressure ? 'say_backup_cue' : 'word_say_cue_need',
      posture: input.liveContext
        ? `Operate inside ${input.liveContext.label}. Help the individual user with the current room, not a campaign workflow.`
        : 'Operate as individual LIVE GEORGE. Help the user with the current room, timing, tone, and next move.',
      avoid: [
        'campaign-management framing',
        'firm-mode assumptions',
        'CRM language',
        'long explanations during pressure',
        'generic assistant phrasing',
      ],
      prefer: [
        'short speakable lines',
        'next move first',
        'tone and cadence cues',
        'pressure-aware restraint',
        'one useful response over full frameworks',
      ],
    }
  }

  return {
    runtime: input.runtime,
    maxSentences: adapterCompression ? 4 : highPressure ? 4 : 6,
    defaultFormat: 'direct',
    posture: 'Operate as normal GEORGE: direction, execution, continuity, and anti-drift support.',
    avoid: [
      'therapy tone',
      'generic chatbot language',
      'unnecessary menus',
      'over-explaining once the target is clear',
    ],
    prefer: [
      'name the target',
      'name the pressure or tradeoff',
      'give the strongest next move',
      'ask one leverage question only if needed',
    ],
  }
}

export function buildResponseShapeNote(shape: GeorgeResponseShape) {
  return `
CURRENT RESPONSE SHAPE
- Runtime: ${shape.runtime}
- Posture: ${shape.posture}
- Max default length: ${shape.maxSentences} sentence${shape.maxSentences === 1 ? '' : 's'}
- Default format: ${shape.defaultFormat}
- Prefer: ${shape.prefer.join(', ')}
- Avoid: ${shape.avoid.join(', ')}
`.trim()
}
