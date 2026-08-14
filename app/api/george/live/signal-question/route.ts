import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getRequestIdentity } from '@/lib/security/rate-limit'
import {
  preparationEvidenceNeedIsAlreadyKnown,
  projectNormalPreparationEvidence,
  resolveAdaptivePreparationTransition,
} from '@/lib/george/live-runtime/live-preparation-controller'
import { createOperationalMemory } from '@/lib/george/operational-memory/operational-memory'
import { createRedisOperationalFormulaLibrary } from '@/lib/george/operational-memory/redis-formula-library'
import {
  applyOperationalMemoryRetrievalPolicy,
  buildFormulaRetrievalContext,
  normalizeFormulaRetrievalType,
} from '@/lib/george/operational-memory/retrieval-policy'
import {
  buildOperationalMemoryEvidenceNote,
  createOperationalMemoryRuntimeEvidence,
} from '@/lib/george/operational-memory/runtime-evidence'
import type { RetrievedOperationalFormula } from '@/lib/george/operational-memory/types'
import { readGeorgeSession } from '@/lib/security/george-session'
import { formulateAuthorizedSignalQuestion } from '@/lib/george/live-runtime/authorized-signal-question'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type PriorInteractionStatus = 'answered' | 'skipped' | 'unknown'

type PriorInteraction = {
  key: string
  question: string
  answer: string
  status: PriorInteractionStatus
  evidenceNeed?: string
}

type SignalQuestionRequest = {
  interactionMode?: 'briefing' | 'ask_george' | 'briefing_examples'
  userTurn?: string
  role?: string
  broadGoal?: string
  desiredOutcome?: string
  acceptableOutcome?: string
  audience?: string
  room?: string
  knownContext?: string
  documentSummary?: string
  priorAnswers?: Record<string, string>
  priorInteractions?: Array<{
    key?: string
    question?: string
    answer?: string
    status?: 'answered' | 'skipped' | 'unknown'
    evidenceNeed?: string
  }>
  skippedQuestions?: string[]
  pendingQuestion?: {
    key?: string
    question?: string
    evidenceNeed?: string
  } | null
  formula?: {
    id?: string
    version?: number
    source?: 'george' | 'user'
  } | null
  authorizedEvidenceNeed?: string
  authorizationReason?: string
  normalPreparationContext?: {
    session?: unknown
    activeNormalSessionId?: string | null
    linkedPreparationSessionId?: string | null
    currentConversation?: Array<{
      role?: string
      content?: string | null
      source?: string | null
      presentationMode?: string | null
    }>
    evidenceSufficiency?: 'unresolved' | 'sufficient'
    signalAcquisitionAllowed?: boolean
  } | null
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function preserveText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function normalizePriorInteractions(
  priorInteractions: SignalQuestionRequest['priorInteractions'],
  priorAnswers: Record<string, string>,
  skippedQuestions: string[]
): PriorInteraction[] {
  const interactions = Array.isArray(priorInteractions)
    ? priorInteractions.map((interaction) => ({
        key: preserveText(interaction?.key),
        question: preserveText(interaction?.question),
        answer: preserveText(interaction?.answer),
        status:
          interaction?.status === 'answered' ||
          interaction?.status === 'skipped' ||
          interaction?.status === 'unknown'
            ? interaction.status
            : 'unknown',
        ...(clean(interaction?.evidenceNeed)
          ? { evidenceNeed: clean(interaction?.evidenceNeed) }
          : {}),
      }))
    : []

  const representedKeys = new Set(
    interactions.map((interaction) => clean(interaction.key))
  )

  for (const [key, answer] of Object.entries(priorAnswers)) {
    if (representedKeys.has(clean(key))) continue

    interactions.push({
      key,
      question: '',
      answer: preserveText(answer),
      status: 'answered',
    })
    representedKeys.add(clean(key))
  }

  for (const key of skippedQuestions) {
    if (representedKeys.has(clean(key))) continue

    interactions.push({
      key,
      question: '',
      answer: '',
      status: 'skipped',
    })
    representedKeys.add(clean(key))
  }

  return interactions
}

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit({
      key: `live-signal-question:${getRequestIdentity(req)}`,
      limit: 40,
      windowMs: 60_000,
    })

    if (!rate.ok) {
      return NextResponse.json(
        {
          status: 'sufficient',
          nextAction: 'invoke_operational_judgment',
          transitionReason: 'evidence_sufficient',
          question: '',
          label: 'Signal sufficient',
          helper: 'GEORGE has enough signal for LIVE support.',
          key: 'signal_sufficient',
        },
        { status: 429 }
      )
    }

    const body = (await req.json()) as SignalQuestionRequest
    const normalPreparationInput = body.normalPreparationContext
    const normalPreparationProjection = normalPreparationInput
      ? projectNormalPreparationEvidence({
          session: normalPreparationInput.session,
          activeNormalSessionId:
            normalPreparationInput.activeNormalSessionId,
          linkedPreparationSessionId:
            normalPreparationInput.linkedPreparationSessionId,
          currentConversation: normalPreparationInput.currentConversation,
          evidenceSufficiency:
            normalPreparationInput.evidenceSufficiency,
          signalAcquisitionAllowed:
            normalPreparationInput.signalAcquisitionAllowed,
        })
      : null
    let priorAnswers =
      body.priorAnswers && typeof body.priorAnswers === 'object'
        ? body.priorAnswers
        : {}
    let skippedQuestions = Array.isArray(body.skippedQuestions)
      ? body.skippedQuestions.map(String)
      : []
    let priorInteractions = normalizePriorInteractions(
      body.priorInteractions,
      priorAnswers,
      skippedQuestions
    )

    if (normalPreparationProjection) {
      priorInteractions = normalPreparationProjection.priorInteractions.map(
        (interaction) => ({ ...interaction })
      )
      priorAnswers = Object.fromEntries(
        priorInteractions
          .filter((interaction) => interaction.status === 'answered')
          .map((interaction) => [interaction.key, interaction.answer])
      )
      skippedQuestions = priorInteractions
        .filter((interaction) => interaction.status === 'skipped')
        .map((interaction) => interaction.key)
    }
    const session = await readGeorgeSession(req)
    const operationalMemoryUserId = String(session?.email || '')
      .trim()
      .toLowerCase()

    const interactionMode =
      body.interactionMode === 'ask_george'
        ? 'ask_george'
        : body.interactionMode === 'briefing_examples'
          ? 'briefing_examples'
          : 'briefing'
    const userTurn = clean(body.userTurn)

    if (interactionMode === 'briefing_examples') {
      const desiredOutcome = clean(body.desiredOutcome)
      const role = clean(body.role)
      const counterparty = clean(body.audience)
      const knownContext = clean(body.knownContext)

      if (!desiredOutcome || !userTurn || !process.env.OPENAI_API_KEY) {
        return NextResponse.json({
          examples: [],
        })
      }

      const completion = await openai.chat.completions.create({
        model:
          process.env.OPENAI_MODEL_INTELLIGENT ||
          process.env.OPENAI_MODEL ||
          'gpt-4o',
        temperature: 0.25,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `
You provide quiet example answers for GEORGE's conversational LIVE briefing.

The user's desired outcome is already established.

Do not suggest another outcome.

Generate several plausible answers to the CURRENT BRIEFING QUESTION using the established desired outcome and accumulated briefing evidence.

Return strict JSON:

{
  "examples": string[]
}

Return 4 concise examples whenever the evidence supports four plausible answers.

Each example must:
- directly answer the current question;
- sound like something the user could naturally type;
- remain subordinate to the established desired outcome;
- use established role, counterparty, context, and prior-interaction evidence when available;
- never contradict established evidence;
- never invent unsupported facts, relationships, transactions, commitments, permissions, or capabilities;
- remain short enough for rotating interface guidance;
- never begin with "For example", "Example", "e.g.", or a label;
- never explain why the answer is useful;
- never propose a different desired outcome.

These examples are presentation guidance only.

They are not canonical evidence unless the user actually supplies or accepts the information.

Example:

desired outcome: "Get the job"
current question: "What is your role in this conversation?"

Good:
- "Candidate for the operations role."
- "Internal manager applying for the promotion."
- "External candidate meeting the leadership team."
- "Final-round candidate."

Example:

desired outcome: "Secure the investment"
current question: "Who will you be speaking with?"

Good:
- "The lead investor."
- "A partner at the fund."
- "An angel investor who reviewed the deck."
- "The investment committee lead."

The established outcome is the mission anchor.
            `.trim(),
          },
          {
            role: 'user',
            content: JSON.stringify({
              currentQuestion: userTurn,
              desiredOutcome,
              role,
              counterparty,
              knownContext,
              priorInteractions,
            }),
          },
        ],
      })

      try {
        const parsed = JSON.parse(
          completion.choices?.[0]?.message?.content || '{}'
        )

        const examples = Array.isArray(parsed?.examples)
          ? parsed.examples
              .map((value: unknown) => clean(value))
              .filter(Boolean)
              .slice(0, 4)
          : []

        return NextResponse.json({
          examples,
        })
      } catch {
        return NextResponse.json({
          examples: [],
        })
      }
    }

    let operationalMemoryEvidence = ''
    const effectiveRole = normalPreparationProjection?.role || clean(body.role)
    const effectiveDesiredOutcome =
      normalPreparationProjection?.objective || clean(body.desiredOutcome)
    const effectiveAcceptableOutcome =
      normalPreparationProjection?.acceptableOutcome ||
      clean(body.acceptableOutcome)
    const effectiveAudience =
      normalPreparationProjection?.audience || clean(body.audience)
    const effectiveRoom = normalPreparationProjection?.room || clean(body.room)
    const effectiveFormula = normalPreparationProjection?.formula || body.formula
    const effectiveKnownContext = normalPreparationProjection
      ? normalPreparationProjection.currentUserEvidence.join('\n')
      : clean(body.knownContext)
    const effectiveDocumentSummary = normalPreparationProjection
      ? normalPreparationProjection.qualifiedDocumentEvidence.join('\n')
      : clean(body.documentSummary)

    if (
      operationalMemoryUserId &&
      ((effectiveRoom && effectiveDesiredOutcome) ||
        clean(effectiveFormula?.id))
    ) {
      try {
        const formulaLibrary = createRedisOperationalFormulaLibrary()
        const operationalMemory = createOperationalMemory({ formulaLibrary })
        let selected: RetrievedOperationalFormula[] = []

        if (effectiveRoom && effectiveDesiredOutcome) {
          const retrieved = await operationalMemory.retrieve(
            buildFormulaRetrievalContext({
              userId: operationalMemoryUserId,
              roomType: normalizeFormulaRetrievalType(effectiveRoom),
              objectiveType: normalizeFormulaRetrievalType(
                effectiveDesiredOutcome
              ),
              observedSignalTypes: priorInteractions
                .filter((interaction) => interaction.status === 'answered')
                .map((interaction) =>
                  normalizeFormulaRetrievalType(
                    interaction.evidenceNeed || interaction.key
                  )
                )
                .filter(
                  (value: string | undefined): value is string =>
                    Boolean(value)
                ),
            })
          )
          selected = applyOperationalMemoryRetrievalPolicy(retrieved)
        }

        const selectedFormula = await operationalMemory.retrieveSelected({
          selection: clean(effectiveFormula?.id)
            ? {
                id: clean(effectiveFormula?.id),
                version: Number(effectiveFormula?.version),
              }
            : null,
          userId: operationalMemoryUserId,
        })

        if (selectedFormula) {
          selected = [
            selectedFormula,
            ...selected.filter(
              (candidate) =>
                candidate.formula.id !== selectedFormula.formula.id
            ),
          ]
        }

        operationalMemoryEvidence = buildOperationalMemoryEvidenceNote(
          createOperationalMemoryRuntimeEvidence(selected)
        )
      } catch (error) {
        console.error(
          '[GEORGE][LIVE_SIGNAL_QUESTION][OPERATIONAL_MEMORY_FAILED]',
          error
        )
      }
    }

    const knownSignal = {
      role: effectiveRole,
      broadGoal: clean(body.broadGoal),
      desiredOutcome: effectiveDesiredOutcome,
      acceptableOutcome: effectiveAcceptableOutcome,
      audience: effectiveAudience,
      room: effectiveRoom,
      knownContext: effectiveKnownContext,
      documentSummary: effectiveDocumentSummary,
      priorAnswers,
      priorInteractions,
      skippedQuestions,
      pendingQuestion:
        normalPreparationProjection?.pendingQuestion ||
        (body.pendingQuestion && typeof body.pendingQuestion === 'object'
          ? {
              key: clean(body.pendingQuestion.key),
              question: clean(body.pendingQuestion.question),
              evidenceNeed: clean(body.pendingQuestion.evidenceNeed),
            }
          : null),
      evidenceAuthority: normalPreparationProjection
        ? {
            normalSessionId: normalPreparationProjection.normalSessionId,
            preparationSessionId:
              normalPreparationProjection.preparationSessionId,
            sourcePrecedence: normalPreparationProjection.sourcePrecedence,
            currentUserEvidence:
              normalPreparationProjection.currentUserEvidence,
            confirmedPreparationEvidence:
              normalPreparationProjection.confirmedPreparationEvidence,
            provisionalPreparationEvidence:
              normalPreparationProjection.provisionalPreparationEvidence,
            inferenceEvidence: normalPreparationProjection.inferenceEvidence,
            skippedEvidenceNeeds:
              normalPreparationProjection.skippedEvidenceNeeds,
          }
        : null,
      operationalMemoryEvidence,
    }
    const authorizedEvidenceNeed = clean(body.authorizedEvidenceNeed)
    const authorizationReason = clean(body.authorizationReason)

    if (
      authorizedEvidenceNeed &&
      body.normalPreparationContext &&
      !normalPreparationProjection
    ) {
      return NextResponse.json({
        status: 'unavailable',
        nextAction: 'no_question',
        transitionReason: 'invalid_preparation_identity',
        question: '',
        authorizedEvidenceNeed,
      })
    }

    if (
      authorizedEvidenceNeed &&
      normalPreparationProjection &&
      preparationEvidenceNeedIsAlreadyKnown(
        normalPreparationProjection,
        authorizedEvidenceNeed
      )
    ) {
      return NextResponse.json({
        status: 'unavailable',
        nextAction: 'no_question',
        transitionReason: 'evidence_already_known',
        question: '',
        authorizedEvidenceNeed,
      })
    }

    console.log("[GEORGE][LIVE_SIGNAL_QUESTION][EVIDENCE]", {
      interactionMode,
      userTurn,
      knownSignal: {
        ...knownSignal,
        operationalMemoryEvidence: operationalMemoryEvidence
          ? '[validated operational memory evidence available]'
          : '',
      },
    })

    if (interactionMode === 'ask_george' && userTurn) {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({
          status: 'response',
          interactionMode: 'ask_george',
          response:
            'I can answer that while preserving the current briefing question. Continue when you are ready.',
        })
      }

      const answerCompletion = await openai.chat.completions.create({
        model:
          process.env.OPENAI_MODEL_INTELLIGENT ||
          process.env.OPENAI_MODEL ||
          'gpt-4o',
        temperature: 0.35,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `
You are GEORGE, operating inside an active conversation-preparation session.

The user has explicitly chosen ASK GEORGE.

Answer the user's question directly from the accumulated preparation evidence and current session context.

This turn is conversational assistance, not an answer to GEORGE's current briefing question.

Rules:
- Do not promote the user's question into briefing evidence.
- Do not mark the current briefing question answered.
- Do not replace or consume the unresolved briefing question.
- Do not invent facts that are not supported by the accumulated evidence.
- If the user asks what GEORGE knows, summarize only established evidence.
- If the user asks why a briefing question matters, explain its operational value concisely.
- If the user asks for help answering, help them reason without fabricating their answer.
- Preserve the same GEORGE intelligence, preparation context, and session continuity.
- Be concise and operational.

Return JSON:
{
  "response": "GEORGE's direct response to the user"
}
            `.trim(),
          },
          {
            role: 'user',
            content: JSON.stringify({
              userTurn,
              knownSignal,
            }),
          },
        ],
      })

      const answerRaw =
        answerCompletion.choices?.[0]?.message?.content || '{}'
      const answerParsed = JSON.parse(answerRaw)
      const response = clean(answerParsed?.response)

      return NextResponse.json({
        status: 'response',
        interactionMode: 'ask_george',
        response:
          response ||
          'I can answer that while preserving the current briefing question.',
      })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        status: authorizedEvidenceNeed ? 'unavailable' : 'sufficient',
        nextAction: authorizedEvidenceNeed
          ? 'no_question'
          : 'invoke_operational_judgment',
        transitionReason: authorizedEvidenceNeed
          ? 'question_formulation_unavailable'
          : 'evidence_sufficient',
        question: '',
        label: 'Signal sufficient',
        why: 'No fixed fallback question is authoritative without adaptive evidence reasoning.',
        example: '',
        helper: 'GEORGE will reason from the current validated evidence.',
        key: 'signal_sufficient',
      })
    }

    if (authorizedEvidenceNeed) {
      const formulation = await formulateAuthorizedSignalQuestion({
        client: openai,
        model:
          process.env.OPENAI_MODEL_INTELLIGENT ||
          process.env.OPENAI_MODEL ||
          'gpt-4o',
        authorizedEvidenceNeed,
        authorizationReason,
        knownSignal,
      })

      if (formulation.status !== 'question') {
        return NextResponse.json({
          status: 'unavailable',
          nextAction: 'no_question',
          transitionReason: formulation.reason,
          question: '',
          authorizedEvidenceNeed,
        })
      }

      const transition = resolveAdaptivePreparationTransition({
        assessment: {
          status: 'question',
          key: formulation.key,
          label: formulation.label,
          question: formulation.question,
          why: formulation.why,
          example: formulation.example,
          evidenceNeed: authorizedEvidenceNeed,
          eligibility: 'eligible',
        },
        priorInteractions,
        authorizedEvidenceNeed,
      })

      if (transition.nextAction !== 'ask_question') {
        return NextResponse.json({
          status: 'unavailable',
          nextAction: 'no_question',
          transitionReason: transition.reason,
          question: '',
          authorizedEvidenceNeed,
        })
      }

      return NextResponse.json({
        status: 'question',
        nextAction: transition.nextAction,
        transitionReason: transition.reason,
        question: transition.question.question,
        label: transition.question.label,
        why: transition.question.why,
        example: transition.question.example,
        helper: transition.question.why,
        key: transition.question.key,
        evidenceNeed: authorizedEvidenceNeed,
        clarificationRequired: false,
      })
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_INTELLIGENT || process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `
You are GEORGE's adaptive preparation evidence-acquisition authority.

The desired outcome establishes the briefing mission.

Treat an explicit desiredOutcome as established current-session operational evidence when its meaning is operationally clear. A non-empty field is not automatically resolved.

If any established signal is syntactically incomplete, semantically ambiguous, internally contradictory, or supports multiple materially different interpretations, clarification outranks downstream questioning. Ask one concise clarification question before proceeding.

Do not silently choose among materially different meanings. For example, if the user is discussing funding and enters "150B" as the goal, do not decide whether they mean raising $150B, securing a $150B investment, reaching a $150B valuation, or something else. Ask the user to establish the intended meaning.

When clarifying an existing canonical signal, use one of these semantic keys so the confirmed answer can replace the ambiguous value:
- clarify_role
- clarify_audience
- clarify_knownContext
- clarify_desiredOutcome

Do not ask the user to restate, rename, validate, or generically clarify a signal whose meaning is already operationally clear.

Determine the user's present intent before collecting unrelated signals. Use explicit current-session statements first, then current-session conversation evidence, then relevant history as supporting context, and general inference last. The user may have already expressed the intent or outcome in desiredOutcome, broadGoal, knownContext, or priorInteractions. Reason across all of them before deciding what remains unresolved.

If intent or outcome is genuinely unresolved, ask the minimum direct question needed to establish it. If the intended outcome is already explicit or strongly supported, move downstream: identify the highest-value unresolved condition, obstacle, decision factor, commitment, constraint, or situational fact that could materially affect the user's ability to achieve that outcome.

The next question must add operational information. It must not merely produce a more detailed wording of evidence GEORGE already has.

Treat inferred outcomes as provisional until the user confirms them naturally.

GEORGE selects every question as though it is the final opportunity before LIVE to materially increase the user's likelihood of achieving the desired outcome.

Before selecting any next question, reassess the COMPLETE accumulated operational state. Do not continue down the branch created by the most recent answer merely because that answer supports another follow-up.

Use this selection discipline on every briefing turn:

1. ESTABLISHED
Identify what is already established semantically across desiredOutcome, broadGoal, knownContext, documentSummary, priorInteractions, and other current-session evidence. Different wording of the same fact is still established evidence.

2. UNRESOLVED
Identify the operational facts that remain genuinely unresolved for this specific mission. Missing information is only a candidate; it does not automatically deserve a question.

3. INFORMATION AUTHORITY
Before an unresolved candidate is eligible to become a question, determine who should supply the missing value.

Ask the user for information the user is the appropriate authority to supply, including facts, history, observations, constraints, preferences, actual capabilities, commitments, authority, decisions only they can make, and information uniquely available to them.

Do NOT ask the user to perform reasoning that belongs to GEORGE. GEORGE owns professional technique, strategy, analysis, synthesis, positioning, prioritization, tactics, preparation methodology, and expert judgment that can be derived from established evidence.

The user is not required to understand the professional discipline in order to use GEORGE effectively.

For every candidate, ask internally:
"Is this information the user should reasonably supply, or am I asking the user to perform reasoning that belongs to GEORGE?"

If GEORGE can derive the needed value from established evidence using its own expertise, derive it rather than asking the user.

If GEORGE cannot derive it because an underlying user-owned fact is missing, ask for that underlying fact rather than asking the user for the expert conclusion.

Do not invent user-owned facts, permissions, capabilities, commitments, limits, preferences, or decisions.

This doctrine is discipline-independent. Apply it equally in sales, interviews, negotiations, management, presentations, investor conversations, difficult conversations, planning, and every other preparation context.

4. RANK
Compare ALL eligible unresolved user-owned information by expected operational value. Ask which unknown, if resolved now, would most materially change GEORGE's preparation, judgment, timing, support, or the user's likelihood of achieving the established outcome.

Do not rank GEORGE-owned reasoning as though it were missing user evidence. GEORGE should perform that reasoning itself.

5. SELECT
Ask only the single highest-value eligible unresolved question. Foundational mission facts generally outrank deeper elaboration of a dimension GEORGE already understands. A follow-up to the latest answer must compete against every other eligible unresolved candidate before it can be selected.

6. STOP
If no eligible unresolved user-owned information has enough expected operational value to justify another briefing turn, return sufficient. Do not keep interviewing merely because another question is possible or because GEORGE could ask the user to perform more analysis.

A question is wrong when it:
- recursively elaborates the newest answer while a more consequential foundational unknown remains;
- asks for finer detail about an already-useful dimension without comparing other unresolved dimensions;
- asks the user to supply strategy, technique, analysis, synthesis, positioning, tactics, or professional judgment GEORGE should produce;
- asks for an expert conclusion when the actual missing information is an underlying fact the user can supply;
- repeats information GEORGE already knows semantically;
- is selected simply because its field is missing;
- would not materially change preparation or LIVE support.

Do not use a fixed questionnaire or fixed domain ordering. For example, in a sales conversation, offering identity, decision environment, obstacles, economics, timing, or commitment conditions may be relevant candidates, but their priority must be reasoned from the actual accumulated evidence. Never hard-code one of them as universally next.

Reason from the entire briefing conversation and all available operational signal, not only the most recent answer.

Treat priorInteractions as the canonical accumulated briefing conversation. Use priorAnswers and skippedQuestions only as backward-compatible supporting fields, and do not count equivalent history more than once.

A skipped interaction means only that the user chose not to provide that evidence. Reassess the complete current state after a skip. Do not automatically ask another question, stop acquisition, enter LIVE, or continue Normal because of the skip itself.

pendingQuestion is a previously proposed but unanswered question. It is not a committed next step. Reassess whether its evidence need remains the single strongest material gap under the current evidence before asking it again.

Operational Memory Evidence, when present, comes from validated Formula and memory retrieval. Treat it as strategic evidence that may change which uncertainty matters or make another question unnecessary. It never defines a fixed question sequence and never overrides current-session evidence.

For every response, also form GEORGE's current operational understanding from the accumulated evidence and identify concise direction candidates that best represent what the user may be trying to accomplish now.

Keep these concepts distinct:

- Role: the user's operating role, such as Sales.
- Conversation context: what kind of situation this is, such as a second conversation with a prospect.
- Direction / intended outcome: what the user wants this conversation to accomplish.
- Preparation action: something GEORGE may later help prepare, such as an agenda, objection handling, evidence, talking points, or rapport strategy.

Conversation context does not by itself establish the intended outcome.
Preparation actions are not directions.

Return:
- understanding: one concise first-person GEORGE statement addressed directly to the user. Use "you" and "I" naturally. Never refer to the person as "the user." State only what the evidence supports. If the role or context is known but the intended outcome is not, say that plainly rather than inventing a generic successful outcome.
- directions: an array of 3-6 concise labels that answer the interface question "What are you trying to accomplish?" Each label must describe an intended conversational result, movement, commitment, decision, clarification, or change in state. Do not return preparation tasks such as preparing an agenda, planning objection handling, developing rapport, gathering evidence, writing talking points, or rehearsing.

Good direction examples when supported by context:
- Advance the opportunity
- Confirm fit and needs
- Resolve a concern
- Secure the next commitment
- Reach a decision
- Protect margin
- Clarify expectations
- Gain agreement

Bad direction examples:
- Prepare call agenda
- Plan objection handling
- Develop rapport strategies
- Gather evidence
- Draft talking points
- Rehearse responses

Do not invent a call, meeting, interview, discovery stage, audience, objective, or outcome merely from the role. A role such as Sales establishes domain context only.

When knownContext changes the situation, update both understanding and directions from that evidence. Preserve uncertainty where evidence is incomplete.

Treat understanding and directions as provisional operational synthesis, not new user facts.

EVIDENCE DISCIPLINE

Unresolved is a valid operational state.

Do not fill a blank merely because the response structure contains one.

For every material unknown, determine which of these applies:

1. KNOWN
The value is directly established by current-session evidence.

2. SAFELY INFERABLE
The value follows strongly enough from established evidence that materially different interpretations are unlikely.

3. GEORGE CAN ESTABLISH
The value is not yet known, but GEORGE should determine it through its own professional reasoning, research, available tools, operational knowledge, or other authorized capability rather than asking the user to perform GEORGE's work.

4. USER-OWNED
The value depends on a fact, preference, constraint, commitment, authority, capability, observation, decision, or circumstance that only the user can reasonably supply.

5. UNRESOLVED
The value cannot yet be established responsibly.

Use this order:

known
→ safely infer
→ GEORGE establishes
→ ask the user when the information is genuinely user-owned
→ remain unresolved when evidence is still insufficient.

Never guess in order to make the briefing appear complete.

Never convert a plausible example, prior suggestion, inferred interaction, or GEORGE-generated recommendation into established user evidence.

A structured field may remain empty when evidence does not support a responsible value.

Do not ask the user for professional reasoning GEORGE should perform itself.

Do not ask a question merely because a field is empty.

Ask only when the missing user-owned information would materially change strategy, preparation, execution, timing, support, or likelihood of achieving the established outcome.

When another briefing question is appropriate, also generate:

1. Question
2. Why this is important
3. Example of how to construct a strong answer

The example must be a short, plausible REAL ANSWER the user could naturally type in response to the question.

It must not be an instruction, response formula, checklist, or description of what the user should provide.

Good:
question: "What specific type of stocking job are you most interested in?"
example: "Warehouse stocking."

Good:
question: "Who will be making the hiring decision?"
example: "The store manager."

Bad:
"Specify whether you are interested in grocery, warehouse, or retail stocking."

Bad:
"Describe the person responsible for the hiring decision."

The example is illustrative only. Never treat it as established evidence unless the user actually supplies or accepts it.

The example must directly answer the new question in natural user language without restating the established outcome or suggesting a different outcome. If the user has already established an outcome such as closing a sale, do not offer examples such as finalizing the deal, setting an appointment, or choosing another objective. Instead illustrate the unresolved information the question is seeking.

Do not use the example or helper as interface guidance. Do not write "Answer if useful, or skip," repeat the question, or explain that the answer may improve GEORGE's context, timing, or support.

Never repeat a semantically answered question.
Never ask for elaboration merely because an established answer is broad.
Never ask solely because information is missing.
Do not ask about participants, role, documents, objections, timing, audience, or background until the user's intent and outcome make that signal materially useful.

Return JSON matching this schema:
{
  "status": "question" | "sufficient",
  "question": "the single justified question, or empty when sufficient",
  "label": "short presentation label",
  "why": "why this evidence materially changes preparation",
  "example": "a concise natural example answer",
  "key": "stable semantic key",
  "evidenceNeed": "a concise domain-neutral description of the underlying user-owned fact being acquired",
  "clarificationRequired": false,
  "understanding": "current evidence-based understanding",
  "directions": ["current plausible intended result"]
}

evidenceNeed identifies meaning, not wording. Semantically equivalent questions must use the same evidenceNeed even when phrased differently.
clarificationRequired is true only when an answered or unknown prior interaction remains materially ambiguous or incomplete and clarification is necessary for a consequential decision.
When status is sufficient, question, evidenceNeed, and key may be empty.
          `.trim(),
        },
        {
          role: 'user',
          content: JSON.stringify({ knownSignal }),
        },
      ],
    })

    const raw = completion.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw)

    let status: 'sufficient' | 'question' =
      parsed?.status === 'sufficient' ? 'sufficient' : 'question'
    let question = clean(parsed?.question)
    let label = clean(parsed?.label) || (status === 'sufficient' ? 'Signal sufficient' : 'Additional signal')
    let why = clean(parsed?.why) || clean(parsed?.helper) || (status === 'sufficient' ? 'Additional signal is unlikely to materially improve context, timing, or support.' : 'This may improve GEORGE’s context, timing, and support.')
    let example = clean(parsed?.example) || (status === 'sufficient' ? '' : 'For example: Describe the key facts, the result that matters, and any constraint that changes the answer.')
    let helper = clean(parsed?.helper) || why
    let key = clean(parsed?.key) || `signal_${Date.now()}`
    let evidenceNeed = clean(parsed?.evidenceNeed) || key
    let eligibility: 'eligible' | 'clarification' | 'duplicate' =
      parsed?.clarificationRequired === true
        ? 'clarification'
        : 'eligible'
    const understanding = clean(parsed?.understanding)
    const directions = Array.isArray(parsed?.directions)
      ? parsed.directions
          .map((value: unknown) => clean(value))
          .filter(Boolean)
          .slice(0, 6)
      : []

    if (status === 'question' && question) {
      const eligibilityCompletion = await openai.chat.completions.create({
        model:
          process.env.OPENAI_MODEL_INTELLIGENT ||
          process.env.OPENAI_MODEL ||
          'gpt-4o',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `
You are GEORGE's preparation question eligibility reviewer.

You are reviewing whether GEORGE's proposed briefing question is legitimate to ask.

The desired outcome is established operational evidence and defines the briefing mission only when its meaning is operationally clear. A populated but materially ambiguous signal remains eligible for one clarification question.

A proposed question is legitimate only if ALL of these are true:

1. OUTCOME VALUE
The answer would materially improve or sharpen GEORGE's ability to help the user achieve the established desired outcome.

Do not approve a question merely because the user could answer it.

2. NOVELTY
The requested information is not already established semantically and is not reasonably inferable from the accumulated evidence.

Evaluate novelty by MEANING, not by the proposed question's wording, label, or key.

Before approving a question, compare the information it seeks against EVERY answered priorInteraction and all other accumulated evidence.

Compare the proposed evidenceNeed against the meaning of every prior interaction, including older interactions that do not yet have an evidenceNeed field. Wording changes do not create novelty.

If an earlier answer already supplies a useful instance, example, achievement, capability, constraint, preference, relationship, result, recognition, history, or other fact that substantially answers the proposed information need, treat that dimension as established.

A proposed question is NOT novel merely because it:
- asks for another example of an already established capability or result;
- changes "achievement" to "recognition", "success", "accomplishment", or similar wording;
- asks the user to elaborate a dimension that is already operationally useful;
- uses a different semantic key or label for substantially overlapping information.

Do not ask for MORE evidence in an already useful dimension unless the additional answer is likely to materially change GEORGE's strategy, preparation, timing, or LIVE support.

When the accumulated briefing already establishes the outcome, role/context, counterparty or target when relevant, and enough concrete evidence for GEORGE to act, apply a strong presumption toward SUFFICIENT. Another question must clear a materially higher bar than simple usefulness.

Do not ask the user to restate, rename, narrow, validate, or translate information GEORGE already understands. This prohibition does not apply when the existing value is materially ambiguous and different interpretations would change preparation or LIVE support.

3. INFORMATION AUTHORITY
The user is the proper authority for the requested information.

USER-OWNED INFORMATION includes:
- facts they know;
- history and what happened;
- observations;
- people and relationships they know;
- constraints;
- actual capabilities;
- authority and permissions;
- commitments already made;
- preferences;
- limits;
- decisions only they can make;
- information uniquely available to them.

GEORGE-OWNED REASONING includes:
- professional technique;
- strategy;
- analysis;
- synthesis;
- positioning;
- prioritization;
- tactics;
- methodology;
- expert judgment;
- deciding how to address an obstacle;
- constructing a value proposition;
- determining an approach from established evidence.

The user must not need professional mastery of the discipline in order to prepare with GEORGE.

4. TURN VALUE
This question is worth spending the next user turn on relative to the complete unresolved state.

The burden is on the NEXT QUESTION to justify another interruption of the user's path to LIVE.

"Potentially helpful", "relevant", "nice to know", or "could add detail" is not enough.

Ask another question only when its answer is reasonably likely to change or materially sharpen what GEORGE will do for the established outcome.

If the proposed answer would mostly add another example, another proof point, finer detail, or confirmation to an already usable briefing dimension, reject it.

If another unresolved user-owned fact would materially improve support more, replace the proposed question with that higher-value question.

If no unresolved user-owned information has enough expected operational value, return sufficient.

When a proposed question is ineligible:

1. Reassess the COMPLETE accumulated evidence and established desired outcome.
2. Identify the highest-value unresolved USER-OWNED FACT that would materially change or sharpen support.
3. Replace the proposed question with that fact question.
4. If no such fact exists, return sufficient.

Do not merely rephrase an ineligible question.
Do not create fixed questionnaires.
Do not use discipline-specific question sequences.
Do not ask questions solely because information is missing.

A skipped interaction is not automatically resolved, but asking the same evidence request again is not justified merely because the user skipped it. Reassess whether a different user-owned fact is material or whether GEORGE should proceed without it.

Return JSON only:

If the proposed question passes every eligibility test:
{
  "verdict": "user_owned_fact",
  "evidenceNeed": "stable semantic description of the user-owned fact",
  "clarificationRequired": false
}

If the proposed wording requests evidence that is materially equivalent to a prior interaction and no consequential clarification exception applies:
{
  "verdict": "duplicate_question"
}

If the proposed question fails, but a better user-owned fact is worth asking:
{
  "verdict": "replace_question",
  "replacement": {
    "status": "question",
    "question": "single highest-value user-owned fact question",
    "label": "short label",
    "why": "concise reason this answer materially sharpens support toward the established outcome",
    "example": "For example: Describe the relevant facts.",
    "key": "semantic_key",
    "evidenceNeed": "stable semantic description of the user-owned fact",
    "clarificationRequired": false
  }
}

If the proposed question fails because it delegates GEORGE-owned reasoning:
{
  "verdict": "george_owned_reasoning",
  "replacement": {
    "status": "question or sufficient",
    "question": "single higher-value underlying user-owned fact question when one is genuinely needed",
    "label": "short label",
    "why": "concise reason",
    "example": "For example: Describe the relevant facts.",
    "key": "semantic_key",
    "evidenceNeed": "stable semantic description of the user-owned fact",
    "clarificationRequired": false
  }
}

If no additional user-owned information has enough operational value:
{
  "verdict": "sufficient",
  "replacement": {
    "status": "sufficient"
  }
}
            `.trim(),
          },
          {
            role: 'user',
            content: JSON.stringify({
              knownSignal,
              proposedQuestion: {
                question,
                label,
                why,
                example,
                evidenceNeed,
              },
            }),
          },
        ],
      })

      const eligibilityRaw =
        eligibilityCompletion.choices?.[0]?.message?.content || '{}'
      const eligibilityParsed = JSON.parse(eligibilityRaw)
      const verdict = clean(eligibilityParsed?.verdict)
      const replacement = eligibilityParsed?.replacement

      if (verdict === 'user_owned_fact') {
        evidenceNeed =
          clean(eligibilityParsed?.evidenceNeed) || evidenceNeed
        eligibility =
          eligibilityParsed?.clarificationRequired === true
            ? 'clarification'
            : eligibility
      }

      if (
        verdict === 'george_owned_reasoning' ||
        verdict === 'replace_question' ||
        verdict === 'duplicate_question' ||
        verdict === 'sufficient'
      ) {
        const replacementStatus =
          verdict === 'sufficient' || verdict === 'duplicate_question'
            ? 'sufficient'
            : replacement?.status === 'question'
              ? 'question'
              : 'sufficient'
        const replacementQuestion = clean(replacement?.question)

        if (
          replacementStatus === 'question' &&
          replacementQuestion
        ) {
          status = 'question'
          question = replacementQuestion
          label = clean(replacement?.label) || 'Additional signal'
          why =
            clean(replacement?.why) ||
            'This fact would materially improve GEORGE’s preparation.'
          example =
            clean(replacement?.example) ||
            'For example: Describe the relevant facts, constraints, and what actually happened.'
          helper = why
          key =
            clean(replacement?.key) ||
            `signal_${Date.now()}`
          evidenceNeed = clean(replacement?.evidenceNeed) || key
          eligibility =
            replacement?.clarificationRequired === true
              ? 'clarification'
              : 'eligible'
        } else {
          status = 'sufficient'
          question = ''
          label = 'Signal sufficient'
          why =
            'GEORGE has enough user-owned information to perform the remaining professional reasoning.'
          example = ''
          helper = why
          key = 'signal_sufficient'
          evidenceNeed = ''
          eligibility =
            verdict === 'duplicate_question' ? 'duplicate' : 'eligible'
        }
      }
    }

    const transition = resolveAdaptivePreparationTransition({
      assessment: {
        status,
        key,
        label,
        question,
        why,
        example,
        evidenceNeed,
        eligibility,
      },
      priorInteractions,
    })

    if (transition.nextAction === 'invoke_operational_judgment') {
      console.log("[GEORGE][LIVE_SIGNAL_QUESTION][DECISION]", {
        status: 'sufficient',
        nextAction: transition.nextAction,
        transitionReason: transition.reason,
        understanding,
        directions,
      })

      return NextResponse.json({
        status: 'sufficient',
        nextAction: transition.nextAction,
        transitionReason: transition.reason,
        question: '',
        label: 'Signal sufficient',
        why:
          transition.reason === 'duplicate_evidence_request'
            ? 'The proposed evidence request is already represented in preparation history.'
            : why,
        example: '',
        helper:
          transition.reason === 'duplicate_evidence_request'
            ? 'GEORGE will reason from the evidence already acquired.'
            : helper,
        key: 'signal_sufficient',
        understanding,
        directions,
      })
    }

    const nextQuestion = transition.question

    console.log("[GEORGE][LIVE_SIGNAL_QUESTION][DECISION]", {
      status: 'question',
      nextAction: transition.nextAction,
      transitionReason: transition.reason,
      question: nextQuestion.question,
      key: nextQuestion.key,
      understanding,
      directions,
    })

    return NextResponse.json({
      status: 'question',
      nextAction: transition.nextAction,
      transitionReason: transition.reason,
      question: nextQuestion.question,
      label: nextQuestion.label,
      why: nextQuestion.why,
      example: nextQuestion.example,
      helper: nextQuestion.why,
      key: nextQuestion.key,
      evidenceNeed: nextQuestion.evidenceNeed,
      clarificationRequired: nextQuestion.clarificationRequired === true,
      understanding,
      directions,
    })
  } catch {
    return NextResponse.json({
      status: 'sufficient',
      nextAction: 'invoke_operational_judgment',
      transitionReason: 'evidence_sufficient',
      question: '',
      label: 'Signal sufficient',
      why: 'GEORGE will proceed from the available operational signal.',
      example: '',
      helper: 'GEORGE will proceed from the available operational signal.',
      key: 'signal_sufficient',
    })
  }
}
