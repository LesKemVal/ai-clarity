import { buildOutcomeReassessmentRuntimeBlock } from './outcome-reassessment'
import type { LiveSupportStyle } from './support-style'
import { normalizeLiveSupportStyle } from './support-style'
import type {
  PreparationRuntimeEvidenceProjection,
  PreparationRuntimeEvidenceValue,
} from './live-preparation-controller'

type RuntimeCapability = {
  label?: string
  description?: string
}

export type LiveRuntimeFormulaSelection = {
  formulaId: string
  formulaVersion: number
  source: "george" | "user"
}

type LiveRuntimeContextSetup = {
  room?: string | null
  objective?: string | null
  language?: string | null
  cadence?: string | null
  communicationStyle?: string | null
  communicationStyleConfirmed?: boolean | null
  supportStyle?: LiveSupportStyle | null
  /** Legacy compatibility. Prefer supportStyle. */
  liveAssistMode?: string | null
  controlWords?: string | null
  outcomeShiftPhrase?: string | null
  outcomeReassessmentPhrase?: string | null
  estimatedCents?: number | null
  runtimeSupport?: {
    selectedCapabilities?: RuntimeCapability[] | null
    runtimeBias?: unknown
    preparationEvidence?: PreparationRuntimeEvidenceProjection | null
  } | null
  formulaSelection?: LiveRuntimeFormulaSelection | null
} | null

type LiveRuntimeContextSupport = {
  room?: string | null
  chair?: string | null
  objective?: string | null
  preparationEvidence?: PreparationRuntimeEvidenceProjection | null
} | null

function appendPreparationEvidenceValue(
  lines: string[],
  label: string,
  value?: PreparationRuntimeEvidenceValue,
) {
  if (!value) return

  lines.push(
    `- ${label}: ${value.value} [source=${value.source}; authority=${value.authority}; rank=${value.rank}]`,
  )
}

export type LiveCommunicationRealizationStyle =
  | 'adaptive'
  | 'executive'
  | 'conversational'

export function normalizeLiveCommunicationRealizationStyle(
  value: unknown
): LiveCommunicationRealizationStyle {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'executive') return 'executive'
  if (normalized === 'conversational') return 'conversational'
  return 'adaptive'
}

function appendPreparationEvidenceValues(
  lines: string[],
  label: string,
  values: readonly PreparationRuntimeEvidenceValue[],
) {
  values.forEach((value, index) => {
    appendPreparationEvidenceValue(lines, `${label} ${index + 1}`, value)
  })
}

function formatPreparationEvidence(
  projection: PreparationRuntimeEvidenceProjection | null,
) {
  if (!projection) return 'No preparation evidence was established for this LIVE entry.'

  const lines = [
    `Preparation session: ${projection.preparationSessionId}`,
    `Preparation provenance: entrySource=${projection.provenance.entrySource}; relations=${JSON.stringify(projection.relations)}`,
    'Confirmed preparation answers:',
  ]

  projection.briefing.priorInteractions.forEach((interaction) => {
    lines.push(`- Status: ${interaction.status}; Question: ${interaction.question}`)
    if (interaction.answer) lines.push(`  Answer: ${interaction.answer}`)
    if (interaction.evidenceNeed) {
      lines.push(`  Evidence need: ${interaction.evidenceNeed}`)
    }
    if (interaction.answerAuthority) {
      lines.push(
        `  Answer authority: source=${interaction.answerAuthority.source}; authority=${interaction.answerAuthority.authority}; rank=${interaction.answerAuthority.rank}`,
      )
    }
  })

  lines.push('Preparation knowledge with preserved classification:')
  const knowledge = projection.knowledge
  appendPreparationEvidenceValue(lines, 'Objective', knowledge.objective)
  appendPreparationEvidenceValues(
    lines,
    'Baseline assumption',
    knowledge.baselineAssumptions,
  )
  appendPreparationEvidenceValue(lines, 'Name', knowledge.name)
  appendPreparationEvidenceValue(lines, 'Role', knowledge.role)
  appendPreparationEvidenceValues(lines, 'Participant', knowledge.participants)
  appendPreparationEvidenceValue(lines, 'Audience', knowledge.audience)
  appendPreparationEvidenceValues(lines, 'Perspective', knowledge.perspectives)
  appendPreparationEvidenceValue(
    lines,
    'Conversation title',
    knowledge.conversation.title,
  )
  appendPreparationEvidenceValue(
    lines,
    'Conversation group',
    knowledge.conversation.group,
  )
  appendPreparationEvidenceValue(lines, 'Known context', knowledge.knownContext)
  appendPreparationEvidenceValue(
    lines,
    'Communication medium',
    knowledge.communicationMedium,
  )
  appendPreparationEvidenceValue(
    lines,
    'Receiver evidence',
    knowledge.receiverEvidence,
  )
  appendPreparationEvidenceValue(
    lines,
    'Acceptable outcome',
    knowledge.acceptableOutcome,
  )
  appendPreparationEvidenceValue(
    lines,
    'Secondary outcome',
    knowledge.secondaryOutcome,
  )
  appendPreparationEvidenceValue(lines, 'Room objective', knowledge.roomObjective)

  Object.entries(knowledge.additionalSignals).forEach(([key, value]) => {
    appendPreparationEvidenceValue(lines, `Additional signal ${key}`, value)
  })

  knowledge.documents.forEach((evidenceAsset) => {
    appendPreparationEvidenceValue(
      lines,
      `Qualified document ${evidenceAsset.name} (${evidenceAsset.kind})`,
      evidenceAsset.evidence,
    )
  })

  lines.push('Preparation readiness and workflow:')
  lines.push(`- Confirmations: ${JSON.stringify(projection.readiness.confirmations)}`)
  lines.push(`- Workflow: ${JSON.stringify(projection.readiness.workflow)}`)

  if (projection.briefing.currentQuestion) {
    lines.push(
      `Current preparation question (not an answer): ${projection.briefing.currentQuestion.question}`,
    )
  }

  lines.push('Presentation-only preparation metadata (not evidence):')
  projection.briefing.priorInteractions.forEach((interaction) => {
    if (interaction.presentation?.example) {
      lines.push(`- ${interaction.key} example: ${interaction.presentation.example}`)
    }
  })
  if (projection.briefing.currentQuestion?.presentation?.example) {
    lines.push(
      `- ${projection.briefing.currentQuestion.key} example: ${projection.briefing.currentQuestion.presentation.example}`,
    )
  }

  return lines.join('\n')
}

export function buildLiveRuntimeContext(params: {
  liveMode: boolean
  runtimeSupport: LiveRuntimeContextSupport
  setup: LiveRuntimeContextSetup
  steeringLabels: string[]
}) {
  if (!params.liveMode) return ''

  const { runtimeSupport, setup } = params
  const steeringLabels = params.steeringLabels || []

  const room = runtimeSupport?.room || setup?.room || 'not specified'
  const chair = runtimeSupport?.chair || 'User'
  const objective = runtimeSupport?.objective || setup?.objective || 'not specified'
  const move = steeringLabels[0] || 'idle'
  const angle = steeringLabels[1] || 'idle'
  const pressure = steeringLabels[2] || 'idle'
  const language = setup?.language || 'English'
  const cadence = setup?.cadence || 'Balanced'
  const communicationStyle = setup?.communicationStyleConfirmed === true
    ? normalizeLiveCommunicationRealizationStyle(setup.communicationStyle)
    : 'adaptive'
  const communicationStyleAuthority =
    setup?.communicationStyleConfirmed === true
      ? 'confirmed preparation preference'
      : 'adaptive default; no confirmed speaking-style preference'
  const supportStyle = normalizeLiveSupportStyle(setup?.supportStyle || setup?.liveAssistMode)
  const triggerPhrase =
    setup?.outcomeShiftPhrase ||
    setup?.outcomeReassessmentPhrase ||
    setup?.controlWords ||
    null

  const selectedFormula = setup?.formulaSelection
    ? `Selected Formula: ${setup.formulaSelection.formulaId} (v${setup.formulaSelection.formulaVersion}, ${setup.formulaSelection.source})`
    : null

  const selectedCapabilities = Array.isArray(setup?.runtimeSupport?.selectedCapabilities)
    ? setup.runtimeSupport.selectedCapabilities
        .map((item) => `- ${item.label}: ${item.description}`)
        .join('\\n')
    : 'none'

  const runtimeBias = Array.isArray(setup?.runtimeSupport?.runtimeBias)
    ? JSON.stringify(setup.runtimeSupport.runtimeBias)
    : 'none'
  const preparationEvidence =
    runtimeSupport?.preparationEvidence ||
    setup?.runtimeSupport?.preparationEvidence ||
    null

  return `LIVE RUNTIME AUTHORITY

The following information has already been established.

Do not ask the user to restate, redefine, rediscover, or clarify these items unless the user explicitly says they have changed.

Room: ${room}
Chair: ${chair}
Outcome: ${objective}
Move: ${move}
Angle: ${angle}
Pressure: ${pressure}
Language: ${language}
Cadence: ${cadence}
Speaking style realization: ${communicationStyle} (${communicationStyleAuthority})
Support style: ${supportStyle}
${selectedFormula || ""}

Treat these as current operational reality.

Speaking style is a realization preference, not a persona or reasoning authority.
Explicit current-turn direction, the objective, room evidence, safety, user agency, and receiver constraints outrank it.
Adaptive remains evidence-responsive. Executive means structured and measured, not aggressive. Conversational means natural and direct, not casual at the expense of the objective.

Your responsibility is execution, adaptation, timing, and movement toward the outcome.

Do not revert into intake behavior.
Do not ask broad discovery questions.
Protect trajectory.

LIVE CONTINUATION + STEERING DOCTRINE

Desired outcome is the destination.
Secondary outcome is used only when the primary objective has clearly failed or become unreachable.
Continuation is always available by default.

When the user speaks a partial thought and pauses, GEORGE may continue the sentence according to the established conversational trajectory.

The user owns the voice.
GEORGE protects the trajectory.

Steering phrases do not change the destination unless the user explicitly changes the objective.
Steering phrases change execution behavior: tone, compression, firmness, leverage protection, cue density, exact wording, timing, or closure style.

If the user says “Negotiation mode,” keep the same trajectory but adjust behavior:
- stronger anchoring
- increased leverage protection
- more precise language
- slower concession behavior
- heightened detection of pressure tactics
- earlier identification of BATNAs
- more deliberate closure language
- stronger boundary preservation
- more intentional silence

If the user says “Let’s keep this tight,” compress.
If the user says “Say it this way,” provide exact repeatable wording.
If the user says “Hold the line here,” preserve position and reduce concession.
If the user says “Bring it back to,” restore trajectory.
If the user says “Close with,” move toward commitment, ownership, timing, or next action.

Do not output blank templates in LIVE.
Never say: “Target: __. First step: __. Owner: __. Due: __.”
Convert structures into speakable continuation sentences.

Bad:
Target: __. First step: __. Owner: __. Due: __.

Good:
Before we leave, confirm the target, the first move, who owns it, and when it happens.

Choose the smallest useful intervention:
- sentence completion
- cue
- exact line
- warning
- silence

If GEORGE is wrong, the user may ignore, interrupt, redirect, or override without penalty.
Steering phrases: ${setup?.controlWords || 'none'}
Outcome reassessment trigger: ${setup?.outcomeShiftPhrase || setup?.outcomeReassessmentPhrase || 'user-defined natural transition phrase'}
Estimated runtime cost: ${setup?.estimatedCents ? `${setup.estimatedCents} cents` : 'not estimated'}

Runtime support selected:
${selectedCapabilities}

Runtime behavior bias:
${runtimeBias}

Canonical preparation evidence:
${formatPreparationEvidence(preparationEvidence)}

LIVE separation doctrine:
- This is LIVE, not normal GEORGE.
- Do not use normal GEORGE planning language.
- Do not ask broad onboarding questions like “what outcome matters most?” unless the user explicitly asks for planning.
- LIVE GEORGE should listen, adapt, and attempt to win the room by default.
- If no room was selected or context is unclear, GEORGE should observe first instead of interrogating the user.
- For greetings like “hello,” “hey,” or “what’s up,” respond minimally: “I’m listening.” “Go ahead.” “Keep going.”
- Do not assume context from a single word, name, nickname, joke, greeting, or slang phrase.
- “what’s up doc?” does not mean medical context.
- Infer conversation context gradually from accumulated conversational pressure, repeated signals, role behavior, and objective indicators.
- When clues accumulate, ask one short confirmation only: “Interview?” “Doctor context?” “Negotiation?”
- Once context is confirmed or highly likely, adapt silently and give one operational cue or line.
- If the user gives no steering at all, GEORGE should still try to carry the user's likely objective toward the strongest positive outcome.

Steering doctrine:
- The user has agency and may see conversation context GEORGE cannot see.
- Steering phrases are human runtime overrides, not normal conversation content.
- Treat steering phrases as both signal and possible sentence-starter.
- If the user says “hmm,” “right,” “one second,” “let me think,” “OK,” “shorter,” or “line,” infer the adjustment and continue from that social opening when useful.
- Do not treat “pause” as the primary outcome-shift command. It is too fragile for live conversations.
- If the user uses their outcome-shift phrase, enter Outcome Reassessment Mode. Listen for the new possible destination, preserve the active outcome until confirmed, and continue in a way that surfaces or tests the shift.
- Keep commands, labels, pricing, and debug signals internal.
- Visible output must remain one operational deliverable: either one cue or one repeatable line.${buildOutcomeReassessmentRuntimeBlock({
    triggerPhrase,
  })}`
}
