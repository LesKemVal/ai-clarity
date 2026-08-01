import type { OutcomeGovernorSnapshot } from "@/lib/george/live-voice/runtime/outcome-governor"
import type { LiveOutcomeObservation } from "@/lib/george/live-runtime/live-outcome-review"
import {
  buildLiveInteractionContinuity,
  buildLiveOutcomeReview,
} from "@/lib/george/live-runtime/live-interaction-continuity"
import type {
  LivePrepSetup,
  LiveRuntimeSupport,
  LiveRuntimeUsageRecord,
} from "@/lib/george/live-runtime/prep-runtime"

import {
  readActiveLiveRuntimeSupport,
} from "./live-prep-storage"
import {
  reconcileActiveLiveRuntimeUsage,
} from "./live-runtime-usage"

const LAST_RUNTIME_SUMMARY_KEY =
  "george_last_live_runtime_summary"
const LAST_OUTCOME_OBSERVATION_KEY =
  "GEORGE_LAST_LIVE_OUTCOME_OBSERVATION"
const LAST_CONVERSATION_RECORD_KEY =
  "GEORGE_LAST_CONVERSATION_RECORD"
const ACTIVE_SETUP_KEY =
  "george_live_setup_active"

export type LiveCompletionInput = {
  desiredOutcome: string
  conversationContext: string
  transcript: string
  transcriptEvidenceCount: number
  outcomeGovernor?: OutcomeGovernorSnapshot | null
  outcomeReview?: LiveOutcomeObservation | null
  runtimeSupport?: LiveRuntimeSupport | null
  setup?: LivePrepSetup | null
  persistUsage?: boolean
}

export type LiveCompletionResult = {
  usage: LiveRuntimeUsageRecord | null
  outcomeReview: LiveOutcomeObservation
  conversationRecord: ReturnType<
    typeof buildLiveInteractionContinuity
  >["conversationRecord"]
}

function readStoredSetup() {
  if (typeof window === "undefined") return null

  try {
    const value = window.localStorage.getItem(ACTIVE_SETUP_KEY)
    return value ? (JSON.parse(value) as LivePrepSetup) : null
  } catch {
    return null
  }
}

function persistOutcomeReview(
  outcomeReview: LiveOutcomeObservation
) {
  window.localStorage.setItem(
    LAST_OUTCOME_OBSERVATION_KEY,
    JSON.stringify(outcomeReview)
  )
}

async function requestOperationalLearning(
  conversationRecord: LiveCompletionResult["conversationRecord"]
) {
  const response = await fetch(
    "/api/george/operational-memory/learn",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationRecord,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(
      `Operational learning request failed: ${response.status}`
    )
  }
}

export function readLastLiveOutcomeObservation() {
  if (typeof window === "undefined") return null

  try {
    const value = window.localStorage.getItem(
      LAST_OUTCOME_OBSERVATION_KEY
    )

    return value
      ? (JSON.parse(value) as LiveOutcomeObservation)
      : null
  } catch {
    return null
  }
}

export function prepareLiveCompletionReview(
  input: Omit<
    LiveCompletionInput,
    "outcomeReview" | "persistUsage"
  > & {
    persistUsage?: boolean
  }
) {
  const runtimeSupport =
    input.runtimeSupport ||
    readActiveLiveRuntimeSupport()

  const usage =
    input.persistUsage === false
      ? null
      : reconcileActiveLiveRuntimeUsage({
          setup: input.setup || readStoredSetup(),
          runtimeSupport,
        })

  if (usage) {
    window.localStorage.setItem(
      LAST_RUNTIME_SUMMARY_KEY,
      usage.summary
    )
  }

  const outcomeReview =
    readLastLiveOutcomeObservation() ||
    buildLiveOutcomeReview({
      desiredOutcome: input.desiredOutcome,
      transcript: input.transcript,
      supportSummary: usage?.summary || "",
      outcomeGovernor: input.outcomeGovernor,
    })

  persistOutcomeReview(outcomeReview)

  return {
    usage,
    outcomeReview,
  }
}

export async function completeLiveConversation(
  input: LiveCompletionInput
): Promise<LiveCompletionResult> {
  if (typeof window === "undefined") {
    throw new Error(
      "LIVE completion requires the browser host"
    )
  }

  const runtimeSummary =
    window.localStorage.getItem(
      LAST_RUNTIME_SUMMARY_KEY
    ) || ""

  const setup = input.setup || readStoredSetup()

  const outcomeReview =
    input.outcomeReview ||
    buildLiveOutcomeReview({
      desiredOutcome: input.desiredOutcome,
      transcript: input.transcript,
      supportSummary: runtimeSummary,
      outcomeGovernor: input.outcomeGovernor,
    })

  persistOutcomeReview(outcomeReview)

  const continuity = buildLiveInteractionContinuity({
    desiredOutcome: outcomeReview.desiredOutcome,
    conversationContext: input.conversationContext,
    transcript: input.transcript,
    transcriptEvidenceCount:
      input.transcriptEvidenceCount,
    formulaSelection: setup?.formulaSelection || null,
    supportSummary: runtimeSummary,
    outcomeGovernor: input.outcomeGovernor,
    outcomeReview,
  })

  window.localStorage.setItem(
    LAST_CONVERSATION_RECORD_KEY,
    JSON.stringify(continuity.conversationRecord)
  )

  try {
    await requestOperationalLearning(
      continuity.conversationRecord
    )
  } catch (error) {
    console.error(
      "[GEORGE][OPERATIONAL_MEMORY][LEARN_REQUEST_FAILED]",
      error
    )
  }

  return {
    usage: null,
    outcomeReview,
    conversationRecord:
      continuity.conversationRecord,
  }
}
