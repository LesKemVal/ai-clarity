import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const storePath = path.join(process.cwd(), 'data', 'subscription-state.json')

export async function GET() {
  try {
    const raw = fs.readFileSync(storePath, 'utf8')
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({
      currentTier: 'smart',
      lastCheckoutSessionId: null,
      lastSubscriptionId: null,
      lastCustomerId: null,
    })
  }
}
