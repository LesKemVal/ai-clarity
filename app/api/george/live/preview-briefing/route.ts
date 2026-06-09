import { NextResponse } from 'next/server'

type PreviewBriefingRequest = {
  identity?: string
  room?: string
  role?: string
  primaryObjective?: string
  secondaryObjective?: string
  observedReality?: string
  knownContext?: string
  signals?: unknown
}

type PreviewBriefingResponse = {
  briefing: string
  strategyExists: boolean
  strategyIntro: string
  strategyText: string
  strategyReason: string
  strategyConsentLabel: string
  supportLine: string
  agencyLine: string
  steeringPhrase: string
  steeringExplanation: string
}

export async function POST(request: Request) {
  let body: PreviewBriefingRequest = {}

  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const identity = body.identity?.trim() || 'there'
  const primaryObjective = body.primaryObjective?.trim() || 'the objective'

  const response: PreviewBriefingResponse = {
    briefing: `${identity}.\n\nI understand the objective.\n\nThe current priority is ${primaryObjective}.`,
    strategyExists: false,
    strategyIntro: '',
    strategyText: '',
    strategyReason: '',
    strategyConsentLabel: '',
    supportLine: "Lead naturally. I'll adapt as the conversation develops.",
    agencyLine: '',
    steeringPhrase: '',
    steeringExplanation: '',
  }

  return NextResponse.json(response)
}
