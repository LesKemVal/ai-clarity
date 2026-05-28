'use client'

import type { PrepRoomResourceProfile } from '@/lib/george/prep-room/resources'
import { getPrepRoomResourceOptions } from '@/lib/george/prep-room/resource-options'

type Props = {
  open: boolean
  profile: PrepRoomResourceProfile | null
  onClose: () => void
  onEnterLive?: () => void
  onEditResource?: <K extends keyof PrepRoomResourceProfile>(key: K, value: PrepRoomResourceProfile[K]) => void
}

type SteeringMap = {
  phrase: string
  hears: string
  behavior: string
  line: string
}

const STEERING_MAP: SteeringMap[] = [
  {
    phrase: 'let me think',
    hears: 'Hold / buy time',
    behavior: 'GEORGE slows down, avoids rushing, and prepares a cleaner next line.',
    line: 'Let me think about that for one second —',
  },
  {
    phrase: 'ok, and',
    hears: 'Continue / next move',
    behavior: 'GEORGE carries the conversation forward without sounding like a command.',
    line: 'Ok, and the next thing I want to separate is —',
  },
  {
    phrase: 'fair point',
    hears: 'Soften / acknowledge',
    behavior: 'GEORGE preserves trust first, then helps pivot back toward the objective.',
    line: 'Fair point — and the way I’d look at it is —',
  },
  {
    phrase: 'what I mean is',
    hears: 'Reframe',
    behavior: 'GEORGE cleans up the thought and reshapes the sentence naturally.',
    line: 'What I mean is, the real issue is —',
  },
  {
    phrase: 'let’s be clear',
    hears: 'Firm / direct',
    behavior: 'GEORGE strengthens posture and compresses the message.',
    line: 'Let’s be clear — the point is —',
  },
]

function formatValue(value: string) {
  return value.replace(/_/g, ' ')
}

export function PrepRoomResourcePopup({ open, profile, onClose, onEnterLive, onEditResource }: Props) {
  if (!open || !profile) return null

  const options = getPrepRoomResourceOptions()
  const activeSummary = [
    formatValue(profile.recommendedPosture),
    formatValue(profile.cadence),
    formatValue(profile.compression),
    formatValue(profile.cueDensity),
  ].join(' · ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/52 px-3 py-4 backdrop-blur-[14px] transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]">
      <style jsx>{`
        @keyframes prepShimmer {
          0% { transform: translateX(-45%) rotate(12deg); opacity: 0; }
          20% { opacity: 0.7; }
          55% { opacity: 0.42; }
          100% { transform: translateX(215%) rotate(12deg); opacity: 0; }
        }

        @keyframes liveDeployPulse {
          0%, 100% { box-shadow: 0 12px 32px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.04); }
          22% { box-shadow: 0 0 0 1px rgba(143,182,255,0.26), 0 0 34px rgba(143,182,255,0.22), inset 0 1px 0 rgba(255,255,255,0.08); transform: scale(1.01); }
          50% { box-shadow: 0 12px 32px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.04); }
          76% { box-shadow: 0 0 0 1px rgba(143,182,255,0.30), 0 0 42px rgba(143,182,255,0.24), inset 0 1px 0 rgba(255,255,255,0.08); transform: scale(1.012); }
        }
      `}</style>

      <div className="relative flex max-h-[min(520px,calc(100dvh-22px))] w-full max-w-[470px] flex-col overflow-hidden rounded-[1rem] border border-white/[0.07] bg-[#05080D]/94 shadow-[0_22px_70px_rgba(0,0,0,0.52)] backdrop-blur-xl transition duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(143,182,255,0.105),transparent_36%)] opacity-80" />
        <div className="pointer-events-none absolute -inset-y-28 -left-1/2 w-[72%] animate-[prepShimmer_5.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#8FB6FF]/[0.075] to-transparent" />
        <div className="pointer-events-none absolute -inset-x-32 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative shrink-0 px-4 pb-3 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#8FB6C9]/52">LIVE Preview</p>
              <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-0.045em] text-white">
                Steering behavior
              </h2>
            </div>
            <div className="rounded-full border border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.055] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/68">
              Runtime ready
            </div>
          </div>

          <p className="mt-2 text-[12px] leading-5 text-white/48">
            These phrases are not app commands. They are natural sentence starters GEORGE uses to adjust timing, tone, and the next words.
          </p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div className="rounded-[0.86rem] border border-[#8FB6C9]/[0.09] bg-black/24 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">GEORGE selected</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/58">You can override</p>
            </div>
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-white/58">
              {profile.roomType} · {profile.pressureLevel} pressure · {activeSummary}
            </p>
          </div>

          <div className="mt-3 space-y-2">
            {STEERING_MAP.map((item) => (
              <div key={item.phrase} className="rounded-[0.86rem] border border-white/[0.055] bg-white/[0.018] px-3 py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-[15px] font-medium tracking-[-0.02em] text-white/82">{item.phrase}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/58">{item.hears}</p>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-white/44">{item.behavior}</p>
                <p className="mt-1.5 rounded-[0.6rem] border border-white/[0.04] bg-black/20 px-2 py-1.5 text-[11px] leading-4 text-white/56">
                  Repeatable line begins: <span className="text-white/76">{item.line}</span>
                </p>
              </div>
            ))}
          </div>

          <details className="group mt-3 rounded-[0.86rem] border border-white/[0.055] bg-black/18 px-3 py-2">
            <summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.22em] text-white/34 transition hover:text-white/58">
              Edit runtime posture
            </summary>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <ResourceSelect label="Posture" value={profile.recommendedPosture} options={options.posture} onChange={(value) => onEditResource?.('recommendedPosture', value as PrepRoomResourceProfile['recommendedPosture'])} />
              <ResourceSelect label="Cadence" value={profile.cadence} options={options.cadence} onChange={(value) => onEditResource?.('cadence', value as PrepRoomResourceProfile['cadence'])} />
              <ResourceSelect label="Compression" value={profile.compression} options={options.compression} onChange={(value) => onEditResource?.('compression', value as PrepRoomResourceProfile['compression'])} />
              <ResourceSelect label="Cue density" value={profile.cueDensity} options={options.cueDensity} onChange={(value) => onEditResource?.('cueDensity', value as PrepRoomResourceProfile['cueDensity'])} />
              <ResourceSelect label="Interruption" value={profile.interruptionHandling} options={options.interruptionHandling} onChange={(value) => onEditResource?.('interruptionHandling', value as PrepRoomResourceProfile['interruptionHandling'])} />
              <ResourceSelect label="Texture" value={profile.responseTexture} options={options.responseTexture} onChange={(value) => onEditResource?.('responseTexture', value as PrepRoomResourceProfile['responseTexture'])} />
            </div>
          </details>
        </div>

        <div className="relative shrink-0 border-t border-white/10 bg-[#05080D]/94 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-1 py-1 text-[11px] uppercase tracking-[0.22em] text-white/30 transition duration-150 hover:text-white/62 active:scale-[0.96] active:text-white"
            >
              Close
            </button>
            <button
              onClick={onEnterLive}
              className="animate-[liveDeployPulse_520ms_cubic-bezier(0.22,1,0.36,1)_1] rounded-[0.8rem] border border-[#8FB6C9]/[0.18] bg-[linear-gradient(180deg,rgba(18,28,38,0.92),rgba(5,8,13,0.98))] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#D7DCFF]/82 shadow-[0_12px_32px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-150 hover:border-[#8FB6C9]/[0.32] hover:text-white active:scale-[0.96]"
            >
              Now start LIVE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

type ResourceOption = {
  value: string
  label: string
  description: string
  bestFor?: string
}

function ResourceSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: ResourceOption[]
  onChange: (value: string) => void
}) {
  const selected = options.find((option) => option.value === value)

  return (
    <label className="group rounded-[0.72rem] border border-white/[0.055] bg-black/20 p-2 transition hover:border-white/14 hover:bg-white/[0.025]">
      <span className="text-[9px] uppercase tracking-[0.2em] text-white/28">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full appearance-none rounded-[0.62rem] border border-white/[0.065] bg-black/42 px-2 py-1.5 text-[12px] capitalize text-white/82 outline-none transition focus:border-white/22"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#090B10] text-white">
            {option.label || formatValue(option.value)}
          </option>
        ))}
      </select>
      {selected ? (
        <p className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-white/38">
          {selected.description}
        </p>
      ) : null}
    </label>
  )
}
