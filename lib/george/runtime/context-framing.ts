import type { CurrentGeorgeRuntime } from '@/lib/george/chat/current-runtime-policy'
import type { OperationalJudgment } from '@/lib/george/runtime/operational-judgment'

export type ContextFramingTitle = 'Current Situation' | 'What Matters Now'
export type ContextFramingLabel = 'Objective' | 'Pressure' | 'Priority' | 'Leverage' | 'Risk' | 'Unknown' | 'Avoid' | 'Opportunity' | 'Constraint'
export type ContextFramingItem = { label: ContextFramingLabel; value: string }
export type ContextFraming = { show: boolean; title: ContextFramingTitle; items: ContextFramingItem[]; source: 'context_framing' }
export type ContextFramingInput = { runtime: CurrentGeorgeRuntime; latestUserText: string; voiceMode?: boolean; operationalJudgment: OperationalJudgment }

const HIGH_VALUE_SITUATION = /\b(interview|investor|investment|board|executive|negotiat|meeting|sales call|pitch|presentation|difficult conversation|conflict|legal|court|crisis|decision|offer|raise|promotion|objection|client|customer)\b/i
const SIMPLE_TASK = /\b(rewrite|proofread|translate|summarize|spell|capital of|define|convert|calculate|fix this typo)\b/i

export function resolveContextFraming(input: ContextFramingInput): ContextFraming {
  const latestUserText = String(input.latestUserText || '').trim()
  const isLive = input.runtime === 'live_george'
  const show = shouldShowContextFraming({ isLive, voiceMode: Boolean(input.voiceMode), latestUserText, operationalJudgment: input.operationalJudgment })
  return {
    show,
    title: isLive ? 'What Matters Now' : 'Current Situation',
    items: show ? buildFramingItems(latestUserText, input.operationalJudgment).slice(0, 4) : [],
    source: 'context_framing',
  }
}

function shouldShowContextFraming(input: { isLive: boolean; voiceMode: boolean; latestUserText: string; operationalJudgment: OperationalJudgment }) {
  if (!input.latestUserText) return false
  if (input.isLive && input.voiceMode) return false
  if (SIMPLE_TASK.test(input.latestUserText)) return false
  if (input.isLive) return true
  return HIGH_VALUE_SITUATION.test(input.latestUserText) || input.operationalJudgment.action === 'protect_objective' || input.operationalJudgment.action === 'restore_continuity' || input.operationalJudgment.action === 'warn_and_move'
}

type Situation = 'investor' | 'interview' | 'negotiation' | 'executive' | 'difficult_conversation' | 'general'

function buildFramingItems(text: string, judgment: OperationalJudgment): ContextFramingItem[] {
  const situation = classifySituation(text)
  const items: ContextFramingItem[] = [
    { label: 'Objective', value: judgment.outcomeState.immediateOutcome },
    { label: 'Pressure', value: resolvePressure(text, situation, judgment) },
    { label: 'Priority', value: resolvePriority(situation, judgment) },
  ]
  if (judgment.action === 'acquire_smallest_signal' && judgment.smallestSignal) {
    items.push({ label: 'Unknown', value: resolveUnknown(text, situation, judgment.smallestSignal) })
  } else {
    items.push({ label: 'Avoid', value: resolveAvoidance(situation, judgment) })
  }
  return items
}

function classifySituation(text: string): Situation {
  if (/\b(investor|investment|venture|vc|fundrais|term sheet|board seat|valuation)\b/i.test(text)) return 'investor'
  if (/\b(interview|interviewer|candidate|job offer|hiring)\b/i.test(text)) return 'interview'
  if (/\b(negotiat|counteroffer|salary|compensation|terms|price)\b/i.test(text)) return 'negotiation'
  if (/\b(board|executive|leadership|strategy meeting)\b/i.test(text)) return 'executive'
  if (/\b(difficult conversation|conflict|employee|relationship|confront)\b/i.test(text)) return 'difficult_conversation'
  return 'general'
}

function resolvePressure(text: string, situation: Situation, judgment: OperationalJudgment) {
  if (situation === 'investor') return /\b(control|board|veto|governance)\b/i.test(text) ? 'Investor confidence in execution may determine how much governance control they seek.' : 'The investor must believe the execution case before commitment becomes credible.'
  if (situation === 'interview') return 'The interviewer is testing whether your evidence supports the confidence you project.'
  if (situation === 'negotiation') return 'The other side may use uncertainty or urgency to pull you into an early concession.'
  if (situation === 'executive') return 'Decision confidence depends on whether the evidence, risks, and ownership are clear.'
  if (situation === 'difficult_conversation') return 'Emotion and defensiveness can displace the issue that actually needs resolution.'
  if (judgment.action === 'restore_continuity') return 'An unresolved prior commitment or dependency is shaping the current move.'
  if (judgment.liveSupport.posture === 'recommend') return 'The situation is moving from preparation into real-time execution pressure.'
  return 'A constraint, tradeoff, or resistance is affecting the desired outcome.'
}

function resolvePriority(situation: Situation, judgment: OperationalJudgment) {
  if (situation === 'investor') return 'Strengthen execution confidence before governance becomes the negotiation.'
  if (situation === 'interview') return 'Anchor your claims in specific evidence before expanding the story.'
  if (situation === 'negotiation') return 'Clarify value and leverage before discussing concessions.'
  if (situation === 'executive') return 'Make the decision, evidence, and ownership unmistakably clear.'
  if (situation === 'difficult_conversation') return 'Keep the conversation on the real issue and the outcome you need.'
  switch (judgment.action) {
    case 'warn_and_move': return 'Protect the user while preserving the safest useful momentum.'
    case 'restore_continuity': return 'Restore the unresolved thread before relying on the next move.'
    case 'acquire_smallest_signal': return 'Resolve the single decision-critical unknown before expanding the plan.'
    case 'protect_objective': return 'Protect the desired outcome before tactics or options expand.'
    case 'execute_live_move': return 'Act on the single most useful move for the current room moment.'
    case 'advance_outcome': return 'Advance the desired outcome with the strongest reliable next move.'
    default: return 'Clarify what matters most before broader guidance.'
  }
}

function resolveAvoidance(situation: Situation, judgment: OperationalJudgment) {
  if (situation === 'investor') return 'Do not negotiate governance before establishing confidence in execution.'
  if (situation === 'interview') return 'Do not substitute broad claims for evidence the interviewer can evaluate.'
  if (situation === 'negotiation') return 'Do not negotiate against yourself or concede before the tradeoff is explicit.'
  if (situation === 'executive') return 'Do not bury the decision under detail or leave ownership ambiguous.'
  if (situation === 'difficult_conversation') return 'Do not let defensiveness or side issues replace the conversation that must happen.'
  if (judgment.delivery === 'short') return 'Do not bury the next move under explanation or competing options.'
  return 'Do not make a premature move that weakens the desired outcome.'
}

function resolveUnknown(text: string, situation: Situation, smallestSignal: string) {
  const candidate = String(smallestSignal || '').trim().replace(/\s+/g, ' ')
  const isGeneric = !candidate || /^(the )?(one|single|smallest) (fact|signal|detail|unknown)|decision-critical|would change the next move/i.test(candidate)

  if (!isGeneric) return normalizeSentence(candidate)

  if (situation === 'investor') {
    if (!/\bterm sheet\b/i.test(text)) {
      return 'Whether this discussion is pre-term-sheet or already in term-sheet negotiation.'
    }
    return 'Whether there is referenceable competing investor interest or committed capital.'
  }
  if (situation === 'interview') return 'Which capability or concern the interviewer is most likely to test.'
  if (situation === 'negotiation') return 'Which term is truly non-negotiable for the other side.'
  if (situation === 'executive') return 'Who owns the decision and what evidence they still require.'
  if (situation === 'difficult_conversation') return 'What outcome the other person needs in order to move forward.'
  return 'The specific fact that would materially change the next move.'
}

function normalizeSentence(value: string) {
  const text = String(value || '').trim().replace(/\s+/g, ' ')
  if (!text) return 'One decision-critical fact is still missing.'
  return /[.!?]$/.test(text) ? text : `${text}.`
}
