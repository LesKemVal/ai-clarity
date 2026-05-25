import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'GEORGE by BRANESx'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #06070A 0%, #0B0D12 50%, #080A0F 100%)',
          color: '#D7DBE4',
          padding: 72,
          fontFamily: 'Arial, Helvetica, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 18% 18%, rgba(143,182,201,0.18), transparent 26%), radial-gradient(circle at 82% 20%, rgba(170,180,255,0.16), transparent 28%), radial-gradient(circle at 65% 86%, rgba(126,201,218,0.10), transparent 30%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 72,
            right: 72,
            top: 318,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(143,182,201,0.52), transparent)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 34, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -8, color: '#F4F6FA' }}>B</div>
            <div style={{ width: 5, height: 126, borderRadius: 8, background: '#8FB6C9', opacity: 0.76 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: -8 }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#AAB4FF', transform: 'rotate(-32deg)' }}>↗</div>
              <div style={{ fontSize: 70, fontWeight: 300, color: '#F4F6FA', marginTop: -18 }}>x</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 30, letterSpacing: 12, color: '#D7DBE4' }}>BRANESx</div>
            <div style={{ fontSize: 18, letterSpacing: 6, color: 'rgba(215,219,228,0.46)' }}>OPERATIONAL AI</div>
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 78, fontWeight: 760, letterSpacing: -5, lineHeight: 0.96, color: '#F4F6FA' }}>
            GEORGE by BRANESx
          </div>
          <div style={{ width: 760, fontSize: 34, lineHeight: 1.24, color: 'rgba(215,219,228,0.72)' }}>
            Prepare. Respond. Keep momentum when timing, pressure, and words matter.
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 18, letterSpacing: 7, color: 'rgba(215,219,228,0.40)' }}>
            DIRECTION → ACTION → SIGNAL
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: '#8FB6C9' }} />
            <div style={{ fontSize: 18, letterSpacing: 4, color: 'rgba(215,219,228,0.46)' }}>branEsx.com</div>
          </div>
        </div>
      </div>
    ),
    size
  )
}
