import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContinuityEmail({
  email,
  continuityUrl,
}: {
  email: string
  continuityUrl: string
}) {
  const from = process.env.RESEND_FROM_EMAIL

  if (!from) {
    throw new Error('Missing RESEND_FROM_EMAIL')
  }

  return resend.emails.send({
    from,
    to: email,
    subject: 'Continue with GEORGE',
    html: `
      <div style="background:#0B0D12;padding:40px;font-family:Inter,Arial,sans-serif;color:#EAEAEA;">
        <div style="max-width:560px;margin:0 auto;background:#11141B;border:1px solid rgba(124,140,255,0.14);border-radius:24px;padding:32px;">
          
          <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#7C8CFF;margin-bottom:18px;">
            GEORGE
          </div>

          <h1 style="font-size:24px;line-height:1.3;margin:0 0 18px 0;color:white;">
            Continue where you left off.
          </h1>

          <p style="font-size:15px;line-height:1.8;color:#A9B0C7;margin:0 0 28px 0;">
            Your continuity link restores your GEORGE access and verified continuity on this device.
          </p>

          <a
            href="${continuityUrl}"
            style="
              display:inline-block;
              background:#7C8CFF;
              color:black;
              text-decoration:none;
              font-weight:600;
              padding:14px 22px;
              border-radius:999px;
            "
          >
            Continue with GEORGE
          </a>

          <p style="font-size:12px;line-height:1.7;color:#697089;margin-top:32px;">
            This link expires in 15 minutes and can only be used once.
          </p>

        </div>
      </div>
    `,
  })
}
