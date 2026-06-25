import type { CueDepth, LiveSupportStyle } from './support-style'

export type CueDepthInput = {
  supportStyle?: LiveSupportStyle
  runtimeIntent?: string
  roomPressure?: string
  interruptionRisk?: number
  confidence?: number
  responseForm?: string
  audio?: boolean
}

export function determineCueDepth(input: CueDepthInput): CueDepth | undefined {
  if (input.supportStyle !== 'cue') return undefined

  const runtimeIntent = String(input.runtimeIntent || '').toUpperCase()
  const roomPressure = String(input.roomPressure || '')
  const interruptionRisk = Number(input.interruptionRisk || 0)
  const confidence = Number(input.confidence || 0)

  if (
    runtimeIntent === 'OBJECTION_RESPONSE' ||
    roomPressure === 'authority'
  ) {
    return 'extended'
  }

  if (
    runtimeIntent === 'ANSWER_QUESTION' ||
    runtimeIntent === 'CLARIFICATION_REQUEST' ||
    roomPressure === 'high' ||
    interruptionRisk >= 0.78
  ) {
    return 'advisory'
  }

  if (
    runtimeIntent === 'TACTICAL_CUE' ||
    runtimeIntent === 'PRESENTATION_CONTINUATION' ||
    confidence < 0.58
  ) {
    return 'tactical'
  }

  return input.audio ? 'brief' : 'tactical'
}
