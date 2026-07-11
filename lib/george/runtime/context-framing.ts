import type { CurrentGeorgeRuntime } from '@/lib/george/chat/current-runtime-policy'
import type { OperationalJudgment } from '@/lib/george/runtime/operational-judgment'

export type ContextFramingTitle = 'Current Situation' | 'What Matters Now'

export type ContextFramingItem = {
  label: 'Objective' | 'Pressure' | 'Priority' | 'Avoid'
  focus: string
}

export type ContextFraming = {
  show: boolean
  title: ContextFramingTitle
  items: ContextFramingItem[]
  source: 'context_framing'
}

export type ContextFramingInput = {
  runtime: CurrentGeorgeRuntime
  latestUserText: string
  voiceMode?: boolean
  operationalJudgment: OperationalJudgment
}

const HIGH_VALUE_SITUATION = /\b(interview|investor|investment|board|executive|negotiat|meeting|sales call|pitch|presentation|difficult conversation|conflict|legal|court|crisis|decision|offer|raise|promotion|objection|client|customer)\b/i
const SIMPLE_TASK = /\b(rewrite|proofread|translate|summarize|spell|capital of|define|convert|calculate|fix this typo)\b/i

export function resolveContextFraming(input: ContextFramingInput): ContextFraming {
  const latestUserText = String(input.latestUserText || '').trim()
  const isLive = input.runtime === 'live_george'
  const show = shouldShowContextFraming({
    isLive,
    voiceMode: Boolean(input.voiceMode),
    latestUserText,
    operationalJudgment: input.operationalJudgment,
  })

  return {
    show,
    title: isLive ? 'What Matters Now' : 'Current Situation',
    items: show ? buildFramingItems(input.operationalJudgment) : [],
    source: 'context_framing',
  }
}

function shouldShowContextFraming(input: {
  isLive: boolean
  voiceMode: boolean
  latestUserText: string
  operationalJudgment: OperationalJudgment
}) {
  if (!input.latestUserText) return false
  if (input.isLive && input.voiceMode) return false
  if (SIMPLE_TASK.test(input.latestUserText)) return false
  if (input.isLive) return true

  return (
    HIGH_VALUE_SITUATION.test(input.latestUserText) ||
    input.operationalJudgment.action === 'protect_objective' ||
    input.operationalJudgment.action === 'restore_continuity' ||
    input.operationalJudgment.action === 'warn_and_move'
  )
}

function buildFramingItems(
  judgment: OperationalJudgment
): ContextFramingItem[] {
  return [
    {
      label: 'Objective',
      focus: 'State the user\'s actual desired outcome from the current conversation context.',
    },
    {
      label: 'Pressure',
      focus: describePressure(judgment),
    },
    {
      label: 'Priority',
      focus: describePriority(judgment),
    },
    {
      label: 'Avoid',
      focus: describeAvoidance(judgment),
    },
  ]
}

function describePressure(judgment: OperationalJudgment) {
  if (judgment.action === 'restore_continuity') {
    return 'Name the unresolved prior commitment, thread, or dependency affecting the current move.'
  }

  if (judgment.action === 'acquire_smallest_signal') {
    return 'Name the single missing fact preventing a reliable operational move.'
  }

  if (judgment.liveSupport.posture === 'recommend') {
    return 'Name the real-time execution pressure or imminent room condition shaping the decision.'
  }

  return 'Name the main constraint, tradeoff, resistance, or uncertainty affecting the outcome.'
}

function describePriority(judgment: OperationalJudgment) {
  switch (judgment.action) {
    case 'warn_and_move':
      return 'State the safest useful move that protects the user while preserving momentum.'
    case 'restore_continuity':
      return 'State what must be restored before the next move can be trusted.'
    case 'acquire_smallest_signal':
      return judgment.smallestSignal
        ? `Acquire only this missing signal: ${judgment.smallestSignal}`
        : 'Acquire only the smallest missing signal required to proceed.'
    case 'protect_objective':
      return 'State the move that best protects the user\'s desired outcome before tactics expand.'
    case 'execute_live_move':
      return 'State the single most useful move for the current room moment.'
    case 'advance_outcome':
      return 'State the strongest next move that advances the desired outcome.'
    default:
      return 'State what deserves attention first before broader guidance.'
  }
}

function describeAvoidance(judgment: OperationalJudgment) {
  if (judgment.action === 'acquire_smallest_signal') {
    return 'Do not invent context or give a broad plan before the missing signal is known.'
  }

  if (judgment.delivery === 'short') {
    return 'Do not bury the next move under explanation or multiple competing options.'
  }

  return 'Name the most likely premature move, distraction, or concession that could weaken the outcome.'
}
