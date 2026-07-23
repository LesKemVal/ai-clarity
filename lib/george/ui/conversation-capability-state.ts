export type GeorgeConversationCapability = 'normal' | 'live_preparation' | 'pitch_deck'

export type GeorgeConversationMessagePhase = 'conversation' | 'information_collection' | 'delivery'

export type GeorgeConversationMessageContext = {
  capability: GeorgeConversationCapability
  phase: GeorgeConversationMessagePhase
}

export type GeorgeAssumptionAuthority =
  | 'confirmed_by_user'
  | 'carried_from_prior_context'
  | 'inferred_from_current_session'
  | 'suggested_by_george'
  | 'missing'

export type GeorgeEditableAssumption = {
  id: string
  label: string
  value: string
  authority: GeorgeAssumptionAuthority
  updatedAt?: number
}

export type GeorgeConversationAttachment = {
  id: string
  name: string
  mediaType: string
  size?: number
  status: 'pending' | 'extracting' | 'ready' | 'failed'
  preview?: string
  extractedText?: string
}

/**
 * Canonical presentation contract for capability work on the Normal GEORGE surface.
 *
 * This module describes UI state only. It must not decide that a capability is useful,
 * choose runtime behavior, infer user facts, or route LIVE delivery.
 *
 * Product rules preserved here:
 * - The conversation remains the workspace. LIVE preparation and Pitch Deck work do not
 *   become separate intelligences or questionnaire applications.
 * - GEORGE keeps the same voice and OpenAI access. Capability state changes presentation
 *   subtly: message container, composer accent, and a small typography increase while
 *   collecting information.
 * - A message keeps the capability context it had when created. When work returns to
 *   ordinary conversation, later messages return to the normal neutral presentation.
 * - Existing context reduces repetition but is never silently trusted. Carried facts,
 *   current-session inferences, and GEORGE suggestions must be visible and editable before
 *   they are relied on for a deck, LIVE preparation, or another consequential work product.
 * - LIVE preparation must resolve material ambiguity before entering LIVE Entry.
 * - Long user messages and extracted file content should render as collapsible conversation
 *   objects. File contents should not be dumped into the visible composer or transcript.
 * - A saved session may show a small pulsing activity dot while capability work is active,
 *   generating, or waiting for an answer. Session metadata owns that durable status; the
 *   Sidebar only presents it.
 * - Help-page documentation is intentionally deferred until the interaction is implemented
 *   and validated.
 */

export const GEORGE_CONVERSATION_PRESENTATION = {
  normal: {
    messageTone: 'neutral',
    composerTone: 'normal',
  },
  live_preparation: {
    messageTone: 'blue',
    composerTone: 'blue',
  },
  pitch_deck: {
    messageTone: 'light_green',
    composerTone: 'light_green',
  },
} as const

export function resolveGeorgeConversationTextScale(
  phase: GeorgeConversationMessagePhase
): 'normal' | 'collection' {
  return phase === 'information_collection' ? 'collection' : 'normal'
}
