'use client'

import { useState } from 'react'
import BxPageHeader from '@/components/BxPageHeader'

export default function ImagesPage() {
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const createImage = async () => {
    if (loading) return

    const cleanPrompt = prompt.trim()

    if (!cleanPrompt) {
      setError('Describe the visual direction.')
      return
    }

    setLoading(true)
    setError('')
    setImage(null)

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: cleanPrompt, size: '1024x1024', quality: 'medium' }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Image creation failed.')
        return
      }

      if (!data?.image) {
        setError('No image returned.')
        return
      }

      setImage(data.image)
    } catch {
      setError('Image creation failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] overflow-x-hidden overscroll-none bg-[#06070A] px-4 py-5 text-white sm:px-5 sm:py-8">
      <div className="mx-auto flex w-full max-w-[860px] flex-col">
        <BxPageHeader
          backLabel="GEORGE"
          rightSlot={null}
        />

        <section className="grid gap-7 md:grid-cols-[0.95fr_1.05fr] md:items-start">
          <div>
            <div className="mb-3 text-[10px] uppercase tracking-[0.26em] text-white/26">VISUAL GENERATION</div>
            <h1 className="text-[34px] font-semibold leading-[0.96] tracking-[-0.055em] text-white/88 md:text-[52px]">Generate visual direction.</h1>
            <p className="mt-4 max-w-[520px] text-[14px] leading-6 text-white/44">
              Use GEORGE to generate concepts, visual references, campaign ideas, product direction, scenes, interfaces, and operational creative work.
            </p>

            <div className="mt-7 rounded-[1rem] border border-white/[0.04] bg-white/[0.010] p-4 shadow-[0_14px_44px_rgba(0,0,0,0.20)]">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={7}
                placeholder="Example: restrained monochrome poster for an operational intelligence product, premium black background, institutional, minimal, useful."
                className="w-full resize-none rounded-[0.85rem] border border-white/[0.04] bg-black/26 px-4 py-3 text-[16px] leading-6 text-white/82 outline-none placeholder:text-white/24 sm:text-[14px]"
              />

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[12px] leading-5 text-white/30">Specific prompts produce stronger visual direction.</p>
                <button type="button" onClick={createImage} disabled={loading} className="touch-manipulation shrink-0 rounded-[0.8rem] bg-white/88 px-4 py-2.5 text-[13px] font-semibold text-[#07080B] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45">
                  {loading ? 'Creating…' : 'Generate'}
                </button>
              </div>

              {error && <div className="mt-4 rounded-[0.75rem] border border-red-300/18 bg-red-300/[0.045] px-3 py-2 text-[13px] text-red-100/72">{error}</div>}
            </div>
          </div>

          <div className="rounded-[1rem] border border-white/[0.04] bg-white/[0.010] p-3 shadow-[0_14px_44px_rgba(0,0,0,0.18)]">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[0.85rem] bg-black/30">
              {image ? <img src={image} alt="Generated visual" className="h-full w-full object-contain" /> : <div className="px-8 text-center text-[13px] leading-6 text-white/30">Visual output appears here.</div>}
            </div>

            {image && (
              <a href={image} download="bx-image.png" className="mt-3 block touch-manipulation rounded-[0.75rem] border border-white/[0.04] px-4 py-2.5 text-center text-[13px] text-white/50 transition hover:bg-white/[0.018] hover:text-white/76">
                Export visual
              </a>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
