export type ContinuityRestorationInput = {
  latestUserText: string
  recentAssistantText?: string
  recentUserText?: string
  earbudActive?: boolean
  continuityWeight?: number
}

export type ContinuityRestorationState = {
  active: boolean
  confidence: 'low' | 'medium' | 'high'
  revealStyle: 'none' | 'short' | 'earbud'
  instruction: string
}

function hasContinuitySignal(text: string) {
  return /\b(continue|resume|restore|pick up|last time|where we left|same goal|same objective|context|room)\b/i.test(text)
}

export function buildContinuityRestorationState(
  input: ContinuityRestorationInput
): ContinuityRestorationState {
  const text = input.latestUserText || ''
  const active =
    hasContinuitySignal(text) ||
    (input.continuityWeight ?? 0) >= 0.6

  const confidence =
    (input.continuityWeight ?? 0) >= 0.75
      ? 'high'
      : active
        ? 'medium'
        : 'low'

  const revealStyle = !active
    ? 'none'
    : input.earbudActive
      ? 'earbud'
      : 'short'

  return {
    active,
    confidence,
    revealStyle,
    instruction: buildContinuityRestorationNote({
      active,
      confidence,
      revealStyle,
    }),
  }
}

function buildContinuityRestorationNote(input: {
  active: boolean
  confidence: ContinuityRestorationState['confidence']
  revealStyle: ContinuityRestorationState['revealStyle']
}) {
  if (!input.active) return ''

  return `
CONTINUITY RESTORATION ACTIVE
- Restore operational state, not transcript.
- Internally infer: objective, relationship posture, pressure point, leverage direction, constraints, and likely next move.
- Reveal only what helps the user continue.
- Default visible restoration is 2–4 short lines.
- Identify the objective and confirm whether it still holds.
- Include one strategic orientation line.
- Do not produce a recap or memory dump.
- If confidence is low or medium, ask a light alignment question like: "Still where we are?"
- If earbud mode is active, compress harder: one checkpoint, one move, one confirmation.
`.trim()
}
