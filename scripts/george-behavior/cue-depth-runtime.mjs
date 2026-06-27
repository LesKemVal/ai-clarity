import { determineCueDepth } from '../../lib/george/live-runtime/cue-depth.ts'

export function run() {
  const lowPressure = determineCueDepth({
    supportStyle: 'cue',
    runtimeIntent: 'TACTICAL_CUE',
    roomPressure: 'low',
    confidence: 0.8,
    audio: true,
  })

  const highPressure = determineCueDepth({
    supportStyle: 'cue',
    runtimeIntent: 'ANSWER_QUESTION',
    roomPressure: 'high',
    confidence: 0.7,
    audio: false,
  })

  const authorityPressure = determineCueDepth({
    supportStyle: 'cue',
    runtimeIntent: 'OBJECTION_RESPONSE',
    roomPressure: 'authority',
    confidence: 0.7,
    audio: false,
  })

  const nonCue = determineCueDepth({
    supportStyle: 'response',
    runtimeIntent: 'ANSWER_QUESTION',
    roomPressure: 'high',
    confidence: 0.7,
    audio: false,
  })

  const failed = []

  if (!lowPressure) failed.push('Cue mode did not produce cue depth.')
  if (highPressure !== 'advisory') failed.push(`High pressure Cue should become advisory, got ${highPressure}.`)
  if (authorityPressure !== 'extended') failed.push(`Authority Cue should become extended, got ${authorityPressure}.`)
  if (nonCue !== undefined) failed.push('Cue depth changed a non-Cue support style.')

  if (failed.length) {
    throw new Error(failed.join(' '))
  }

  return true
}
