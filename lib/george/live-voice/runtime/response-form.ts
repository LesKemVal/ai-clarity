import type { LiveVoicePacket } from '../types'

export function classifyLiveResponseForm(
  text: string,
  fallback?: LiveVoicePacket['responseForm']
): LiveVoicePacket['responseForm'] {
  const clean = String(text || '').trim()

  if (!clean) return fallback || 'silence'
  if (/\?$/.test(clean)) return 'question'
  if (/^(say|tell them|respond|answer):/i.test(clean)) return 'line'
  if (/\b(use|lead with|start with|keep|pause|wait|hold|ask|state|frame|focus)\b/i.test(clean)) return 'direction'
  if (clean.split(/\s+/).length <= 8) return 'cue'

  return fallback || 'direction'
}
