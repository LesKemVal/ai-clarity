'use client'

import { useState } from 'react'
import Link from 'next/link'
import BackButton from '@/components/BackButton'

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
        body: JSON.stringify({
          prompt: cleanPrompt,
          size: '1024x1024',
          quality: 'medium',
        }),
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
    <main className="min-h-[145dvh] overflow-x-hidden overflow-y-scroll overscroll-y-auto touch-pan-y bg-[#06070A] px-4 pb-[220px] pt-6 text-white [-webkit-overflow-scrolling:touch] sm:px-5 sm:py-8">
      <div className="mx-auto flex w-full max-w-[860px] flex-col">
        <div className="mb-8 flex items-center gap-3 border-b border-white/[0.055] pb-5">
          <Link href="/george" aria-label="Back to GEORGE">
            <img
              src="/logofav.png"
              alt="GEORGE"
              className="h-[104px] w-[104px] object-contain opacity-95"
            />
          </Link>

          <span className="text-white/18">→</span>

          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back()
                return
              }

              window.location.href = '/george'
            }}
          >
            <BackButton label="Back" />
          </button>
        </div>

        <section className="grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-start">
          <div>
            <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-white/28">
              VISUAL GENERATION
            </div>

            <h1 className="text-[34px] font-semibold tracking-[-0.055em] text-white md:text-[52px]">
              Generate visual direction.
            </h1>

            <p className="mt-4 max-w-[520px] text-[14px] leading-6 text-white/48">
              Use GEORGE to generate concepts, visual references, campaign ideas, product direction, scenes, interfaces, and operational creative work.
            </p>

            <div className="mt-7 rounded-[1rem] border border-white/[0.055] bg-white/[0.015] p-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={7}
                placeholder="Example: A restrained monochrome poster for an operational intelligence product, premium black background, subtle prescription-mark influence, institutional, minimal, useful."
                className="w-full resize-none rounded-[0.85rem] border border-white/[0.055] bg-black/30 px-4 py-3 text-[16px] leading-6 text-white/82 outline-none placeholder:text-white/24 sm:text-[14px]"
              />

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[12px] leading-5 text-white/30">
                  Specific prompts produce stronger visual direction.
                </p>

                <button
                  type="button"
                  onClick={createImage}
                  disabled={loading}
                  className="touch-manipulation shrink-0 rounded-[0.8rem] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#07080B] transition hover:bg-white/88 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {loading ? 'Creating…' : 'Generate'}
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-[0.75rem] border border-red-300/18 bg-red-300/[0.045] px-3 py-2 text-[13px] text-red-100/72">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1rem] border border-white/[0.055] bg-white/[0.012] p-3">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[0.85rem] bg-black/34">
              {image ? (
                <img src={image} alt="Generated visual" className="h-full w-full object-contain" />
              ) : (
                <div className="px-8 text-center text-[13px] leading-6 text-white/34">
                  Visual output appears here.
                </div>
              )}
            </div>

            {image && (
              <a
                href={image}
                download="bx-image.png"
                className="mt-3 block touch-manipulation rounded-[0.75rem] border border-white/[0.055] px-4 py-2.5 text-center text-[13px] text-white/56 transition hover:bg-white/[0.018] hover:text-white/78"
              >
                Export visual
              </a>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
