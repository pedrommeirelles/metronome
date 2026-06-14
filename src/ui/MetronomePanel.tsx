// Metronome configuration: time signature, subdivision, sound, and volumes.

import { SOUND_BANK } from '../audio/soundBank'
import { useStore } from '../state/store'
import {
  SUBDIVISIONS,
  TIME_SIGNATURE_PRESETS,
  type TimeSignature,
} from '../state/types'

function tsKey(ts: TimeSignature): string {
  return `${ts.beatsPerBar}/${ts.beatUnit}`
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-zinc-400">{label}</span>
      {children}
    </label>
  )
}

const selectClass =
  'rounded-lg bg-zinc-800 px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500'

export function MetronomePanel() {
  const timeSignature = useStore((s) => s.timeSignature)
  const metronome = useStore((s) => s.metronome)
  const setTimeSignature = useStore((s) => s.setTimeSignature)
  const setSubdivision = useStore((s) => s.setSubdivision)
  const setSoundId = useStore((s) => s.setSoundId)
  const setVolume = useStore((s) => s.setVolume)
  const setSubdivisionVolume = useStore((s) => s.setSubdivisionVolume)

  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-4 rounded-2xl bg-zinc-900 p-5 sm:grid-cols-3">
      <Field label="Time signature">
        <select
          className={selectClass}
          value={tsKey(timeSignature)}
          onChange={(e) => {
            const [beatsPerBar, beatUnit] = e.target.value.split('/').map(Number)
            setTimeSignature({ beatsPerBar, beatUnit })
          }}
        >
          {TIME_SIGNATURE_PRESETS.map((ts) => (
            <option key={tsKey(ts)} value={tsKey(ts)}>
              {tsKey(ts)}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Subdivision">
        <select
          className={selectClass}
          value={metronome.subdivision}
          onChange={(e) => setSubdivision(Number(e.target.value))}
        >
          {SUBDIVISIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Sound">
        <select
          className={selectClass}
          value={metronome.soundId}
          onChange={(e) => setSoundId(e.target.value)}
        >
          {SOUND_BANK.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={`Volume ${Math.round(metronome.volume * 100)}%`}>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={metronome.volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="accent-emerald-500"
        />
      </Field>

      <Field
        label={`Subdivision vol ${Math.round(metronome.subdivisionVolume * 100)}%`}
      >
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={metronome.subdivisionVolume}
          onChange={(e) => setSubdivisionVolume(Number(e.target.value))}
          className="accent-emerald-500"
        />
      </Field>
    </div>
  )
}
