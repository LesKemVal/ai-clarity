'use client'

export type CapabilityOpportunity = {
  id: 'pitch_deck'
  label: 'PITCH DECK'
  question: 'PITCH DECK?'
  activationPrompt: string
}

const PITCH_DECK_SIGNAL = /\b(pitch\s*deck|investor\s*deck|fundrais(?:e|ing)|raise\s+(?:money|capital|funding)|investor(?:s|\s+meeting)?|venture\s+capital|seed\s+round|pre[- ]?seed|series\s+[a-z])\b/i

export function detectCapabilityOpportunity(conversationText: string): CapabilityOpportunity | null {
  if (!PITCH_DECK_SIGNAL.test(conversationText)) return null

  return {
    id: 'pitch_deck',
    label: 'PITCH DECK',
    question: 'PITCH DECK?',
    activationPrompt:
      '[CAPABILITY_INTENT:PITCH_DECK] Connect Pitch Deck to this current session. Speak as GEORGE. Explain the immediate benefit of building the pitch deck from what we have already discussed. Mention only the related capabilities that materially support the same objective, and recommend the best order of work. Keep Pitch Deck as the current capability and keep the response concise.',
  }
}
