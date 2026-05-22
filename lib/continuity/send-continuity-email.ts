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
      <div style="margin:0;background:#07090D;padding:28px 16px;font-family:Inter,Arial,sans-serif;color:#EAEAEA;">
        <div style="max-width:500px;margin:0 auto;background:rgba(17,20,27,0.72);border:1px solid rgba(255,255,255,0.08);border-radius:22px;padding:24px;box-shadow:0 18px 48px rgba(0,0,0,0.28);">

          <div style="display:inline-block;background:#0B0D12;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:10px 14px;margin-bottom:18px;">
            <div style="font-size:12px;letter-spacing:0.30em;text-transform:uppercase;color:#D7DBE4;">
              GEORGE
            </div>
          </div>

          <h1 style="font-size:21px;line-height:1.32;margin:0 0 12px 0;color:#F4F6FA;font-weight:500;">
            Continue with GEORGE.
          </h1>

          <p style="font-size:14px;line-height:1.7;color:#A9B0C7;margin:0 0 22px 0;">
            Use this secured continuity link to restore your verified device session.
          </p>

          <a
            href="${continuityUrl}"
            style="
              display:inline-block;
              background:#D7DBE4;
              color:#07090D;
              text-decoration:none;
              font-weight:600;
              font-size:13px;
              padding:12px 18px;
              border-radius:999px;
            "
          >
            Restore session
          </a>

          <p style="font-size:11px;line-height:1.65;color:#697089;margin-top:24px;">
            This link expires in 15 minutes and can only be used once.
          </p>

          <p style="font-size:11px;line-height:1.65;color:#555D72;margin-top:14px;">
            If the button does not open, copy this link into your browser:<br />
            <span style="color:#8F98B8;word-break:break-all;">${continuityUrl}</span>
          </p>

        </div>
      </div>
    `,
  })
}
