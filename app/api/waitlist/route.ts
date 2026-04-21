import { NextResponse } from 'next/server'
import { Resend } from 'resend'

function valid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const email = String(body?.email || '').trim()
    const name = String(body?.name || '').trim()
    const note = String(body?.note || '').trim()

    if (!email || !valid(email)) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM_EMAIL
    const notify = process.env.WAITLIST_NOTIFY_EMAIL

    if (!apiKey || !from || !notify) {
      return NextResponse.json(
        { error: 'Email server not configured.' },
        { status: 500 }
      )
    }

    const resend = new Resend(apiKey)

    await Promise.all([
      resend.emails.send({
        from,
        to: email,
        subject: 'You’re on the GEORGE waitlist',
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6">
            <h2>You’re on the GEORGE waitlist.</h2>
            <p>We received your request for BRANESx / GEORGE updates.</p>
            <p>We’ll notify you when deeper rollout and paid access are ready.</p>
          </div>
        `,
      }),
      resend.emails.send({
        from,
        to: notify,
        replyTo: email,
        subject: 'New GEORGE waitlist signup',
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Name:</strong> ${name || '(none)'}</p>
            <p><strong>Note:</strong> ${note || '(none)'}</p>
          </div>
        `,
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500 }
    )
  }
}
