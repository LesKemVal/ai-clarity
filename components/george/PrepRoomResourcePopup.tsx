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

function formatValue(value: string) {
  return value.replace(/_/g, ' ')
}

export function PrepRoomResourcePopup({ open, profile, onClose, onEnterLive, onEditResource }: Props) {
  if (!open || !profile) return null

  const options = getPrepRoomResourceOptions()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/52 px-3 py-4 backdrop-blur-[14px] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
      <style jsx>{`
        @keyframes liveOperationalPulse {
          0%,100% { box-shadow: 0 10px 30px rgba(0,0,0,0.32); }
          18% { box-shadow: 0 0 0 1px rgba(143,182,255,0.24), 0 0 40px rgba(143,182,255,0.20); transform: scale(1.01); }
          48% { box-shadow: 0 10px 30px rgba(0,0,0,0.32); }
          66% { box-shadow: 0 0 0 1px rgba(143,182,255,0.28), 0 0 48px rgba(143,182,255,0.24); transform: scale(1.012); }
        }

        @keyframes prepShimmer {
          0% { transform: translateX(-45%) rotate(12deg); opacity: 0; }
          20% { opacity: 0.85; }
          55% { opacity: 0.55; }
          100% { transform: translateX(215%) rotate(12deg); opacity: 0; }
        }
      `}</style>

      <div className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-[520px] flex-col overflow-hidden rounded-[1.2rem] border border-white/[0.07] bg-[#05080D]/92 shadow-[0_22px_70px_rgba(0,0,0,0.52)] backdrop-blur-xl transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.10),transparent_34%)] opacity-75" />
        <div className="pointer-events-none absolute -inset-y-28 -left-1/2 w-[72%] animate-[prepShimmer_4.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#8FB6FF]/[0.08] to-transparent" />
        <div className="pointer-events-none absolute -inset-x-32 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />

        <div className="relative shrink-0 px-4 pb-3 pt-4 md:px-5 md:pt-5">
          <p className="text-[10px] uppercase tracking-[0.34em] text-white/32">Prep Room</p>
          <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.045em] text-white md:text-[30px]">
            Final LIVE review
          </h2>
          <p className="mt-2 max-w-xl text-[13px] leading-6 text-white/50">
            GEORGE has read the room and prepared the operating posture. Adjust only what should change before entering LIVE.
          </p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-4 md:px-5">
          <div className="rounded-[1.35rem] border border-white/10 bg-black/35 p-3 shadow-inner shadow-white/[0.02]">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-white/28">Room</p>
                <p className="mt-1.5 text-[13px] font-medium capitalize text-white/84">{profile.roomType}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-white/28">Pressure</p>
                <p className="mt-1.5 text-[13px] font-medium capitalize text-white/84">{profile.pressureLevel}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-white/28">Strategy</p>
                <p className="mt-1.5 text-[12px] leading-5 text-white/52">{profile.strategy}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <ResourceSelect label="Posture" value={profile.recommendedPosture} options={options.posture} onChange={(value) => onEditResource?.('recommendedPosture', value as PrepRoomResourceProfile['recommendedPosture'])} />
            <ResourceSelect label="Cadence" value={profile.cadence} options={options.cadence} onChange={(value) => onEditResource?.('cadence', value as PrepRoomResourceProfile['cadence'])} />
            <ResourceSelect label="Compression" value={profile.compression} options={options.compression} onChange={(value) => onEditResource?.('compression', value as PrepRoomResourceProfile['compression'])} />
            <ResourceSelect label="Cue density" value={profile.cueDensity} options={options.cueDensity} onChange={(value) => onEditResource?.('cueDensity', value as PrepRoomResourceProfile['cueDensity'])} />
            <ResourceSelect label="Interruption handling" value={profile.interruptionHandling} options={options.interruptionHandling} onChange={(value) => onEditResource?.('interruptionHandling', value as PrepRoomResourceProfile['interruptionHandling'])} />
            <ResourceSelect label="Response texture" value={profile.responseTexture} options={options.responseTexture} onChange={(value) => onEditResource?.('responseTexture', value as PrepRoomResourceProfile['responseTexture'])} />
          </div>

          <div className="mt-3 rounded-[1.15rem] border border-white/10 bg-white/[0.025] p-3">
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/32">User last say</p>
            <p className="mt-2 text-[12px] leading-5 text-white/52">
              Cues control how often GEORGE intervenes during LIVE. Light cues protect flow. Balanced cues catch important openings. Dense cues are for training, difficult rooms, or close guidance.
            </p>
          </div>
        </div>

        <div className="relative shrink-0 border-t border-white/10 bg-[#05080D]/92 px-4 py-3 md:px-5">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-1 py-1 text-[11px] uppercase tracking-[0.22em] text-white/30 transition duration-200 hover:text-white/62 active:scale-[0.96] active:text-white"
            >
              Close
            </button>
            <button
              onClick={onEnterLive}
              className="rounded-[0.8rem] border border-[#8FB6C9]/[0.16] bg-[linear-gradient(180deg,rgba(18,28,38,0.92),rgba(5,8,13,0.98))] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#D7DCFF]/76 shadow-[0_12px_32px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 hover:border-[#8FB6C9]/[0.28] hover:text-white active:scale-[0.96]"
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
    <label className="group rounded-[1.15rem] border border-white/10 bg-black/28 p-3 transition hover:border-white/18 hover:bg-white/[0.035]">
      <span className="text-[10px] uppercase tracking-[0.26em] text-white/28">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full appearance-none rounded-[0.95rem] border border-white/10 bg-black/55 px-3 py-2.5 text-[13px] capitalize text-white/86 outline-none transition focus:border-white/26"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#090B10] text-white">
            {option.label || formatValue(option.value)}
          </option>
        ))}
      </select>
      {selected ? (
        <p className="mt-2 text-[11px] leading-5 text-white/44">
          {selected.description}
          {selected.bestFor ? <span className="block pt-1 text-white/28">Best for: {selected.bestFor}</span> : null}
        </p>
      ) : null}
    </label>
  )
}
