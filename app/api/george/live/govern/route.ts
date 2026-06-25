import { NextRequest, NextResponse } from 'next/server'
import { governLiveVoice } from '@/lib/george/live-voice/governor'
import { reasonLiveNextMove } from '@/lib/george/live-voice/live-reasoning'
import { verifyLiveAccessFromRequest } from '@/lib/subscriptions/live-access'
import { checkRateLimit, getRequestIdentity } from '@/lib/security/rate-limit'
import { normalizeLiveSupportStyle } from '@/lib/george/live-runtime/support-style'
import { violatesEvidenceAuthority } from '@/lib/george/core/verification/evidence-gate'
import { continuationEvidence, safeContinuationReplacement } from '@/lib/george/core/verification/continuation-replacement'

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit({
      key: `live-govern:${getRequestIdentity(req)}`,
      limit: 120,
      windowMs: 60_000,
    })

    if (!rate.ok) {
      return NextResponse.json({
        speaker: 'system',
        shouldSpeak: false,
        volley: '',
        cue: '',
        status: 'LIVE governor temporarily rate limited.',
        confidence: 0,
      }, { status: 429 })
    }

    const body = await req.json()
    const access = await verifyLiveAccessFromRequest(req, body?.email)

    if (!access.ok) {
      console.warn('[LIVE][govern][auth-failed]', {
        status: access.status,
        reason: access.error,
      })

      return NextResponse.json({
        speaker: 'system',
        shouldSpeak: false,
        volley: '',
        cue: '',
        status: access.error,
        confidence: 0,
      }, { status: access.status })
    }

    const supportStyle = normalizeLiveSupportStyle(
      body?.supportStyle || body?.deliveryStyle || body?.liveAssistMode
    )

    const packet = governLiveVoice({
      transcript: String(body?.transcript || ''),
      mode: body?.mode === 'voice_live' ? 'voice_live' : 'text_test',
      audio: Boolean(body?.audio),
      contextHint: typeof body?.contextHint === 'string' ? body.contextHint : '',
      desiredOutcome: typeof body?.desiredOutcome === 'string' ? body.desiredOutcome : '',
      activeOutcome: typeof body?.activeOutcome === 'string' ? body.activeOutcome : '',
      shadowMap: typeof body?.shadowMap === 'string' ? body.shadowMap : '',
      lastFiveSeconds: typeof body?.lastFiveSeconds === 'string' ? body.lastFiveSeconds : '',
      supportStyle,
      runtimeIntent: typeof body?.runtimeIntent === 'string' ? body.runtimeIntent : '',
      liveAssistMode: body?.liveAssistMode === 'lines' ? 'lines' : 'cues',
      deliveryStyle: typeof body?.deliveryStyle === 'string' ? body.deliveryStyle : '',
      runtimeMemory:
        body?.runtimeMemory && typeof body.runtimeMemory === 'object'
          ? body.runtimeMemory
          : undefined,
    })

    const reasonedPacket = await reasonLiveNextMove({
      transcript: String(body?.transcript || ''),
      room: typeof body?.contextHint === 'string' ? body.contextHint : '',
      desiredOutcome: typeof body?.desiredOutcome === 'string' ? body.desiredOutcome : '',
      activeOutcome: typeof body?.activeOutcome === 'string' ? body.activeOutcome : '',
      shadowMap: typeof body?.shadowMap === 'string' ? body.shadowMap : '',
      lastFiveSeconds: typeof body?.lastFiveSeconds === 'string' ? body.lastFiveSeconds : '',
      supportStyle,
      runtimeIntent: typeof body?.runtimeIntent === 'string' ? body.runtimeIntent : '',
      liveAssistMode: body?.liveAssistMode === 'lines' ? 'lines' : 'cues',
      deliveryStyle: typeof body?.deliveryStyle === 'string' ? body.deliveryStyle : '',
      fallbackPacket: packet,
    }).catch(() => null)

    const finalPacket = reasonedPacket || packet

    if (supportStyle === 'continue' && finalPacket.volley) {
      const evidence = continuationEvidence({
        transcript: String(body?.transcript || ''),
        lastFiveSeconds: typeof body?.lastFiveSeconds === 'string' ? body.lastFiveSeconds : '',
        shadowMap: typeof body?.shadowMap === 'string' ? body.shadowMap : '',
        desiredOutcome: typeof body?.desiredOutcome === 'string' ? body.desiredOutcome : '',
        activeOutcome: typeof body?.activeOutcome === 'string' ? body.activeOutcome : '',
      })

      const authority = violatesEvidenceAuthority(finalPacket.volley, evidence)

      if (authority.violates) {
        console.warn('[GEORGE][continuation][final-authority-replaced]', {
          reason: authority.reason,
          unsupportedTerms: authority.unsupportedTerms,
          originalVolley: finalPacket.volley,
        })

        finalPacket.volley = safeContinuationReplacement({
          transcript: String(body?.transcript || ''),
          lastFiveSeconds: typeof body?.lastFiveSeconds === 'string' ? body.lastFiveSeconds : '',
          shadowMap: typeof body?.shadowMap === 'string' ? body.shadowMap : '',
          desiredOutcome: typeof body?.desiredOutcome === 'string' ? body.desiredOutcome : '',
          activeOutcome: typeof body?.activeOutcome === 'string' ? body.activeOutcome : '',
        })
        finalPacket.cue = ''
        finalPacket.shouldSpeak = true
        finalPacket.status = `${finalPacket.status || ''} Final continuation authority replacement: ${authority.reason}`.trim()
      }
    }

    return NextResponse.json(finalPacket)
  } catch {
    return NextResponse.json(
      {
        speaker: 'unclear',
        shouldSpeak: false,
        volley: '',
        cue: '',
        status: 'Governor failed safely.',
        confidence: 0,
      },
      { status: 200 }
    )
  }
}
