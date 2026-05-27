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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-xl transition-opacity duration-300">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#030407]/90 shadow-[0_28px_120px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%),linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)] opacity-70" />
        <div className="pointer-events-none absolute -inset-x-32 top-0 h-px animate-[pulse_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="relative grid gap-6 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.38em] text-white/35">Prep Room</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white md:text-3xl">
                Resource setup
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
                GEORGE has read the room and prepared the operating posture. Adjust only what should change before entering LIVE.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-white/45 transition hover:bg-white/[0.07] hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/35 p-4 shadow-inner shadow-white/[0.02]">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/30">Room</p>
                <p className="mt-2 text-sm font-medium capitalize text-white">{profile.roomType}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/30">Pressure</p>
                <p className="mt-2 text-sm font-medium capitalize text-white">{profile.pressureLevel}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/30">Strategy</p>
                <p className="mt-2 text-sm text-white/65">{profile.strategy}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ResourceSelect
              label="Posture"
              value={profile.recommendedPosture}
              options={options.posture}
              onChange={(value) => onEditResource?.('recommendedPosture', value as PrepRoomResourceProfile['recommendedPosture'])}
            />
            <ResourceSelect
              label="Cadence"
              value={profile.cadence}
              options={options.cadence}
              onChange={(value) => onEditResource?.('cadence', value as PrepRoomResourceProfile['cadence'])}
            />
            <ResourceSelect
              label="Compression"
              value={profile.compression}
              options={options.compression}
              onChange={(value) => onEditResource?.('compression', value as PrepRoomResourceProfile['compression'])}
            />
            <ResourceSelect
              label="Cue density"
              value={profile.cueDensity}
              options={options.cueDensity}
              onChange={(value) => onEditResource?.('cueDensity', value as PrepRoomResourceProfile['cueDensity'])}
            />
            <ResourceSelect
              label="Interruption handling"
              value={profile.interruptionHandling}
              options={options.interruptionHandling}
              onChange={(value) => onEditResource?.('interruptionHandling', value as PrepRoomResourceProfile['interruptionHandling'])}
            />
            <ResourceSelect
              label="Response texture"
              value={profile.responseTexture}
              options={options.responseTexture}
              onChange={(value) => onEditResource?.('responseTexture', value as PrepRoomResourceProfile['responseTexture'])}
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">Cue explanation</p>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Cues control how often GEORGE intervenes during LIVE. Light cues protect flow. Balanced cues catch important openings. Dense cues are for training, difficult rooms, or close guidance.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 md:flex-row md:items-center md:justify-between">
            <p className="text-xs leading-5 text-white/40">
              User authority stays active. GEORGE recommends the setup; you approve or edit before entering LIVE.
            </p>
            <button
              onClick={onEnterLive}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
            >
              Enter LIVE now
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
    <label className="group rounded-3xl border border-white/10 bg-black/30 p-4 transition hover:border-white/20 hover:bg-white/[0.04]">
      <span className="text-[11px] uppercase tracking-[0.28em] text-white/30">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full appearance-none rounded-2xl border border-white/10 bg-black/60 px-3 py-3 text-sm capitalize text-white outline-none transition focus:border-white/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label || formatValue(option.value)}
          </option>
        ))}
      </select>
      {selected ? (
        <p className="mt-3 text-xs leading-5 text-white/48">
          {selected.description}
          {selected.bestFor ? <span className="block pt-1 text-white/32">Best for: {selected.bestFor}</span> : null}
        </p>
      ) : null}
    </label>
  )
}
