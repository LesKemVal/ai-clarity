import type { LivePrepSetup } from './prep-runtime'
import { deriveRoomFormation } from '@/lib/george/live/prep-room'

type LiveBriefingMode = 'cues' | 'lines'

type LiveEntryBriefingInput = {
  setup: LivePrepSetup | null
  defaultRoom?: string
}

type SignalSummary = {
  phrase?: string
  meaningLabel?: string
}

function clean(value: unknown) {
  return String(value || '').trim()
}

function normalizeRoom(value: unknown, fallback = 'Adaptive LIVE') {
  const room = clean(value)
  return room || fallback
}

function normalizeAssistMode(setup: LivePrepSetup | null): LiveBriefingMode {
  return setup?.liveAssistMode === 'lines' ? 'lines' : 'cues'
}

function buildPositionLine(setup: LivePrepSetup | null) {
  const position = clean((setup as any)?.userPosition)

  if (!position) return null

  return `Position signal: ${position}`
}

function buildAssistLine(mode: LiveBriefingMode) {
  if (mode === 'lines') {
    return 'Give repeatable lines only when they help execution.'
  }

  return 'Keep cues short unless the moment needs a repeatable line.'
}

function buildSignalLine(setup: LivePrepSetup | null) {
  const signals = (setup as any)?.roomSignals as SignalSummary[] | undefined

  if (!signals || signals.length === 0) return null

  const first = signals[0]

  if (!first?.phrase || !first?.meaningLabel) {
    return 'Steering signals are loaded.'
  }

  return `Steering signal: “${first.phrase}” means “${first.meaningLabel}”.`
}

export function buildLiveEntryBriefing(input: LiveEntryBriefingInput) {
  const setup = input.setup
  const room = normalizeRoom(setup?.room, input.defaultRoom || 'Adaptive LIVE')
  const mode = normalizeAssistMode(setup)
  const signalLine = buildSignalLine(setup)
  const positionLine = buildPositionLine(setup)
  const desiredOutcome = clean(setup?.objective)
  const observedReality =
    clean((setup as any)?.observedReality) ||
    clean((setup as any)?.reality) ||
    clean((setup as any)?.currentReality) ||
    clean((setup as any)?.knownContext)

  const chairs = [
    clean((setup as any)?.userPosition),
    clean((setup as any)?.chair),
  ].filter(Boolean)

  const formation = deriveRoomFormation({
    chairs: chairs.length ? chairs : ['User'],
    desiredOutcome,
    observedReality,
  })

  return [
    'LIVE ENTRY SIGNALS',
    '',
    `Chair: ${formation.humanEntry.chairLabel}`,
    formation.humanEntry.recognition,
    formation.humanEntry.trustDirective,
    formation.humanEntry.signalAcquisitionDirective,
    '',
    `Objective: ${desiredOutcome || 'Not yet provided.'}`,
    `Observed reality: ${observedReality || 'Not yet provided.'}`,
    positionLine,
    `Room formed from signal: ${room}`,
    '',
    `Confidence: ${formation.confidence.level}`,
    formation.nextMandatorySignal
      ? `Next mandatory signal: ${formation.nextMandatorySignal.question}`
      : 'Next mandatory signal: none.',
    formation.nextMandatorySignal
      ? `Reason: ${formation.nextMandatorySignal.reason}`
      : null,
    formation.interpretation,
    formation.entryDirective,
    '',
    signalLine,
    '',
    'Chair creates recognition. Recognition creates trust. Trust reduces apprehension. Cooperation produces signal.',
    'Next best signal is mandatory. All other signals are optional.',
    'Preview is complete. LIVE is execution.',
    'Do not repeat preview work.',
    'Do not create profession brains, modes, or separate expertise layers.',
    'Use the chair only to judge relevance and signal requirements.',
    'Treat the room as formed from signal, not selected as a static mode.',
    'Listen for new signals at all times.',
    'If documents are uploaded during LIVE, treat them as immediately available signal.',
    'If context is interrupted, restore from the objective, observed reality, repeated details, and user-provided signals.',
    'Open briefly, confidently, and in the natural language of the objective and observed reality.',
    '',
    buildAssistLine(mode),
  ].filter(Boolean).join('\n')
}
