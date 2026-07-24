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

export type NormalProviderResult = {
  text: string
  semanticIntent: NormalProviderSemanticIntent
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

const PROVIDER_RESULT_INSTRUCTION = `
PROVIDER RESPONSE CONTRACT
Return one valid JSON object and nothing else:
{
  "text": "The complete user-facing response.",
  "semanticIntent": "answer"
}

semanticIntent must be exactly one of:
- answer
- clarify
- recommend
- execute
- continue
- decline

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

function parseProviderResult(
  rawContent: string | null | undefined
): NormalProviderResult | null {
  const content = rawContent?.trim()
  if (!content) return null

  try {
    const parsed = JSON.parse(removeJsonFence(content)) as {
      text?: unknown
      semanticIntent?: unknown
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
    }
  } catch {
    // Preserve provider availability if a model returns plain text instead
    // of the requested envelope. Semantic metadata remains explicitly absent.
    return {
      text: content,
      semanticIntent: null,
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
