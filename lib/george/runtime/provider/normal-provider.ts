import OpenAI from 'openai'

export type NormalGeorgeProvider = 'openai' | 'groq'

type NormalProviderMessage = {
  role: 'user' | 'assistant'
  content: string
}

type RunNormalTextCompletionInput = {
  provider: NormalGeorgeProvider
  model: string
  systemContent: string
  messages: NormalProviderMessage[]
}

let groqClient: OpenAI | null | undefined

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

export async function runNormalTextCompletion(
  input: RunNormalTextCompletionInput
): Promise<string | null> {
  if (input.provider !== 'groq') return null

  const groq = getGroqClient()
  if (!groq) return null

  const completion = await groq.chat.completions.create({
    model: input.model,
    messages: [
      {
        role: 'system',
        content: input.systemContent,
      },
      ...input.messages,
    ],
  })

  return completion.choices?.[0]?.message?.content?.trim() || null
}
