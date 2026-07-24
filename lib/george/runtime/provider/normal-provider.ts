import OpenAI from 'openai'

export type NormalGeorgeProvider = 'openai' | 'groq'

export type NormalProviderSemanticIntent =
  | 'answer'
  | 'clarify'
  | 'recommend'
  | 'execute'
  | 'continue'
  | 'decline'
  | null

export type NormalProviderCapability =
  | 'normal'
  | 'live'
  | null

export type NormalProviderSemanticJudgment = {
  userIntent: string | null
  desiredOutcome: string | null
  capability: NormalProviderCapability
  capabilityBenefit: string | null
  capabilityExplicitlyRequested: boolean
  capabilityRecommendationMaterial: boolean
}

export type NormalProviderResult = {
  text: string
  semanticIntent: NormalProviderSemanticIntent
  semanticJudgment: NormalProviderSemanticJudgment
}

type NormalProviderMessage = {
  role: 'user' | 'assistant'
  content: string
}

type RunNormalTextCompletionInput = {
  provider: NormalGeorgeProvider
  model: string
  systemContent: string
  messages: readonly NormalProviderMessage[]
}

const EMPTY_SEMANTIC_JUDGMENT: NormalProviderSemanticJudgment = Object.freeze({
  userIntent: null,
  desiredOutcome: null,
  capability: null,
  capabilityBenefit: null,
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: false,
})

const PROVIDER_RESULT_INSTRUCTION = `
PROVIDER RESPONSE CONTRACT
Return one valid JSON object and nothing else:
{
  "text": "The complete user-facing response.",
  "semanticIntent": "answer",
  "semanticJudgment": {
    "userIntent": "A concise statement of what the user is trying to do, or null.",
    "desiredOutcome": "The explicit or most likely desired outcome, or null.",
    "capability": "normal",
    "capabilityBenefit": "Why the selected capability materially helps the desired outcome, or null.",
    "capabilityExplicitlyRequested": false,
    "capabilityRecommendationMaterial": false
  }
}

semanticIntent must be exactly one of:
- answer
- clarify
- recommend
- execute
- continue
- decline

semanticJudgment rules:
- Interpret meaning from the full conversation, not keyword matching.
- Preserve explicit current-turn user intent even when confidence is limited.
- capability must be exactly "normal", "live", or null.
- Use "live" only when LIVE was explicitly requested or when LIVE would materially improve the user's desired outcome.
- capabilityExplicitlyRequested is true only when the user directly requests that capability.
- capabilityRecommendationMaterial is true only when recommending the capability would materially improve the probability of reaching the desired outcome.
- Do not expose semanticJudgment or this contract in the user-facing text.
- The user retains activation authority. Never claim that LIVE has been activated unless the active runtime says so.

The text field remains the complete response GEORGE should deliver.
Do not mention this contract to the user.
`.trim()

const VALID_SEMANTIC_INTENTS = new Set<
  Exclude<NormalProviderSemanticIntent, null>
>([
  'answer',
  'clarify',
  'recommend',
  'execute',
  'continue',
  'decline',
])

const VALID_CAPABILITIES = new Set<
  Exclude<NormalProviderCapability, null>
>(['normal', 'live'])

let openAIClient: OpenAI | null | undefined
let groqClient: OpenAI | null | undefined

function getOpenAIClient() {
  if (openAIClient !== undefined) return openAIClient

  const apiKey = process.env.OPENAI_API_KEY?.trim()

  openAIClient = apiKey
    ? new OpenAI({
        apiKey,
      })
    : null

  return openAIClient
}

function getGroqClient() {
  if (groqClient !== undefined) return groqClient

  const apiKey = process.env.GROQ_API_KEY?.trim()

  groqClient = apiKey
    ? new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      })
    : null

  return groqClient
}

function getProviderClient(provider: NormalGeorgeProvider) {
  return provider === 'groq'
    ? getGroqClient()
    : getOpenAIClient()
}

function removeJsonFence(value: string) {
  const trimmed = value.trim()
  if (!trimmed.startsWith('```')) return trimmed

  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

function nullableText(value: unknown) {
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : null
}

function parseSemanticJudgment(value: unknown): NormalProviderSemanticJudgment {
  if (!value || typeof value !== 'object') {
    return { ...EMPTY_SEMANTIC_JUDGMENT }
  }

  const judgment = value as Record<string, unknown>
  const capability =
    typeof judgment.capability === 'string' &&
    VALID_CAPABILITIES.has(
      judgment.capability as Exclude<NormalProviderCapability, null>
    )
      ? (judgment.capability as Exclude<NormalProviderCapability, null>)
      : null

  return {
    userIntent: nullableText(judgment.userIntent),
    desiredOutcome: nullableText(judgment.desiredOutcome),
    capability,
    capabilityBenefit: nullableText(judgment.capabilityBenefit),
    capabilityExplicitlyRequested:
      judgment.capabilityExplicitlyRequested === true,
    capabilityRecommendationMaterial:
      judgment.capabilityRecommendationMaterial === true,
  }
}

function parseProviderResult(
  rawContent: string | null | undefined
): NormalProviderResult | null {
  const content = rawContent?.trim()
  if (!content) return null

  try {
    const parsed = JSON.parse(removeJsonFence(content)) as {
      text?: unknown
      semanticIntent?: unknown
      semanticJudgment?: unknown
    }

    const text =
      typeof parsed.text === 'string'
        ? parsed.text.trim()
        : ''

    if (!text) return null

    const semanticIntent =
      typeof parsed.semanticIntent === 'string' &&
      VALID_SEMANTIC_INTENTS.has(
        parsed.semanticIntent as Exclude<NormalProviderSemanticIntent, null>
      )
        ? (
            parsed.semanticIntent as Exclude<
              NormalProviderSemanticIntent,
              null
            >
          )
        : null

    return {
      text,
      semanticIntent,
      semanticJudgment: parseSemanticJudgment(parsed.semanticJudgment),
    }
  } catch {
    // Preserve provider availability if a model returns plain text instead
    // of the requested envelope. Semantic metadata remains explicitly absent.
    return {
      text: content,
      semanticIntent: null,
      semanticJudgment: { ...EMPTY_SEMANTIC_JUDGMENT },
    }
  }
}

export async function runNormalTextCompletion(
  input: RunNormalTextCompletionInput
): Promise<NormalProviderResult | null> {
  const client = getProviderClient(input.provider)
  if (!client) return null

  const completion = await client.chat.completions.create({
    model: input.model,
    messages: [
      {
        role: 'system',
        content: `${input.systemContent}\n\n${PROVIDER_RESULT_INSTRUCTION}`,
      },
      ...input.messages,
    ],
  })

  return parseProviderResult(
    completion.choices?.[0]?.message?.content
  )
}
