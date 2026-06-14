// Chord drone controls: on/off, register, waveform, volume. The chord itself is
// driven by the progression (see ProgressionEditor); here we show what's voicing.

import { voiceChordSymbol } from '../audio/chordEngine'
import { useStore } from '../state/store'
import type { RegisterOption, Waveform } from '../state/types'

const REGISTERS: RegisterOption[] = ['low', 'mid', 'high']
const WAVEFORMS: Waveform[] = ['sine', 'triangle', 'sawtooth']

const selectClass =
  'rounded-lg bg-zinc-800 px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-violet-500'

export function DronePanel() {
  const drone = useStore((s) => s.drone)
  const currentChord = useStore((s) => s.currentChord)
  const updateDrone = useStore((s) => s.updateDrone)

  const voiced = currentChord
    ? voiceChordSymbol(currentChord, drone.register)
    : null

  return (
    <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl bg-zinc-900 p-5">
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={drone.enabled}
            onChange={(e) => updateDrone({ enabled: e.target.checked })}
            className="h-4 w-4 accent-violet-500"
          />
          Chord drone
        </label>
        <span className="text-xs text-zinc-500">
          {voiced?.valid ? voiced.notes.join(' · ') : 'no chord'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-400">Register</span>
          <div className="flex gap-1">
            {REGISTERS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => updateDrone({ register: r })}
                className={`flex-1 rounded-lg px-2 py-1 capitalize ${
                  drone.register === r
                    ? 'bg-violet-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-400">Waveform</span>
          <select
            className={selectClass}
            value={drone.waveform}
            onChange={(e) =>
              updateDrone({ waveform: e.target.value as Waveform })
            }
          >
            {WAVEFORMS.map((w) => (
              <option key={w} value={w} className="capitalize">
                {w}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-400">
            Volume {Math.round(drone.volume * 100)}%
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={drone.volume}
            onChange={(e) => updateDrone({ volume: Number(e.target.value) })}
            className="accent-violet-500"
          />
        </label>
      </div>
    </div>
  )
}
