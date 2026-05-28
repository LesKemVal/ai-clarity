'use client'

import {
  readRuntimeControl,
  resetGeorgeRuntimeMemory,
  writeRuntimeControl,
} from '@/lib/george/runtime/runtime-user-controls'

import { useEffect, useState } from 'react'

type Props = {
  adaptiveLearningEnabled?: boolean
  continuityEnabled?: boolean
  earbudModeEnabled?: boolean
}

export default function MemoryContinuityPanel({
  adaptiveLearningEnabled = true,
  continuityEnabled = true,
  earbudModeEnabled = false,
}: Props) {
  const [adaptiveLearning, setAdaptiveLearning] = useState<'auto' | 'on' | 'off'>('auto')
  const [continuityLearning, setContinuityLearning] = useState<'auto' | 'on' | 'off'>('auto')
  const [earbudCompression, setEarbudCompression] = useState<'auto' | 'on' | 'off'>('auto')

  useEffect(() => {
    setAdaptiveLearning(readRuntimeControl('adaptiveLearning', 'auto') as any)
    setContinuityLearning(readRuntimeControl('continuity', 'auto') as any)
    setEarbudCompression(readRuntimeControl('earbudCompression', 'auto') as any)
  }, [])


  const toggleControl = (
    key: 'adaptiveLearning' | 'continuity' | 'earbudCompression',
    value: 'auto' | 'on' | 'off'
  ) => {
    writeRuntimeControl(key, value)

    if (key === 'adaptiveLearning') setAdaptiveLearning(value)
    if (key === 'continuity') setContinuityLearning(value)
    if (key === 'earbudCompression') setEarbudCompression(value)
  }

  const items = [
    {
      label: 'Adaptive Runtime Learning',
      value: adaptiveLearning !== 'off',
      description:
        'GEORGE adapts delivery, pacing, and response structure from runtime interaction signals.',
    },
    {
      label: 'Continuity Restoration',
      value: continuityLearning !== 'off',
      description:
        'GEORGE restores important conversational context, objectives, and operational posture across sessions.',
    },
    {
      label: 'Earbud Runtime Compression',
      value: earbudCompression !== 'off',
      description:
        'GEORGE shortens delivery and prioritizes tactical cues during high-pressure or earbud-assisted interaction.',
    },
  ]

  return (
    <div className="w-full rounded-[2rem] border border-white/[0.06] bg-black/70 backdrop-blur-[24px]">
      <div className="border-b border-white/[0.05] px-6 py-5">
        <div className="text-[0.72rem] uppercase tracking-[0.34em] text-white/38">
          Memory & Continuity
        </div>

        <div className="mt-3 max-w-[38rem] text-[0.95rem] leading-[1.7] text-white/62">
          GEORGE uses continuity, adaptive runtime learning, and operational
          memory to better serve the user — while preserving user agency and
          avoiding rigid assumptions.
        </div>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between gap-5 px-6 py-5"
          >
            <div className="max-w-[38rem]">
              <div className="text-[0.92rem] font-medium text-white/88">
                {item.label}
              </div>

              <div className="mt-2 text-[0.84rem] leading-[1.7] text-white/48">
                {item.description}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (item.label === 'Adaptive Runtime Learning') {
                  toggleControl(
                    'adaptiveLearning',
                    adaptiveLearning === 'auto'
                      ? 'on'
                      : adaptiveLearning === 'on'
                        ? 'off'
                        : 'auto'
                  )
                }

                if (item.label === 'Continuity Restoration') {
                  toggleControl(
                    'continuity',
                    continuityLearning === 'auto'
                      ? 'on'
                      : continuityLearning === 'on'
                        ? 'off'
                        : 'auto'
                  )
                }

                if (item.label === 'Earbud Runtime Compression') {
                  toggleControl(
                    'earbudCompression',
                    earbudCompression === 'auto'
                      ? 'on'
                      : earbudCompression === 'on'
                        ? 'off'
                        : 'auto'
                  )
                }
              }}
              className={`mt-1 h-2.5 w-2.5 rounded-full transition ${
                item.value
                  ? 'bg-[#8FB6C9] shadow-[0_0_12px_rgba(143,182,201,0.7)]'
                  : 'bg-white/14'
              }`}
            />
          </div>
        ))}
      </div>


      <div className="border-t border-white/[0.05] px-6 py-4">
        <button
          type="button"
          onClick={() => {
            resetGeorgeRuntimeMemory()
            window.location.reload()
          }}
          className="rounded-[1rem] border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[0.76rem] uppercase tracking-[0.18em] text-white/48 transition hover:bg-white/[0.06] hover:text-white/82"
        >
          Reset runtime memory
        </button>
      </div>

      <div className="border-t border-white/[0.05] px-6 py-4 text-[0.78rem] leading-[1.7] text-white/34">
        GEORGE treats behavioral adaptation as probabilistic, recalibrates over
        time, and does not convert temporary emotional states into permanent
        identity assumptions.
      </div>
    </div>
  )
}
