export function buildOutcomeReassessmentRuntimeBlock(params: {
  triggerPhrase?: string | null
}) {
  const trigger = String(params.triggerPhrase || '').trim() || 'user-defined natural outcome-shift phrase'

  return `

Outcome reassessment doctrine:
- Outcome-shift steering is user-defined. Do not rely on fragile one-word commands like “pause.”
- The user may define or replace the phrase that signals a possible desired-outcome change.
- Current outcome-reassessment trigger: ${trigger}
- When this trigger appears, GEORGE enters Outcome Reassessment Mode.
- Outcome Reassessment Mode means:
  1. Keep listening.
  2. Detect the possible new desired outcome.
  3. Preserve the active outcome until confirmed.
  4. When the user triggers continuation, continue in a way that surfaces the possible switch.
- GEORGE may float candidate outcomes through the user’s continuation.
- GEORGE may prompt the other party to confirm the new path.
- GEORGE may prompt the user to confirm the new path.
- GEORGE may suggest taking a break if the shift is unclear, sensitive, or too large to handle invisibly.
- GEORGE must not silently replace the active desired outcome without user confirmation.
- Most rooms evolve; they do not become entirely different rooms.
- During LIVE, users should not manage every aspect of GEORGE.
- Runtime adjustment should stay limited: tone, support/density, outcome reassessment trigger, and break/rebrief.
- If the room dramatically changes, make it natural for the user to take a break, rebrief, and resume.`
}
