// Chord drone controls: on/off, register, waveform, volume, plus a temporary
// manual chord field (Phase 4 will drive the chord from the progression).

import { voiceChordSymbol } from '../audio/chordEngine'
import { useStore } from '../state/store'
import type { RegisterOption, Waveform } from '../state/types'

const REGISTERS: RegisterOption[] = ['low', 'mid', 'high']
const WAVEFORMS: Waveform[] = ['sine', 'triangle', 'sawtooth']

const selectClass =
  'rounded-lg bg-zinc-800 px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-violet-500'

export function DronePanel() {
  const drone = useStore((s) => s.drone)
  const chord = useStore((s) => s.chord)
  const updateDrone = useStore((s) => s.updateDrone)
  const setChord = useStore((s) => s.setChord)

  const voiced = voiceChordSymbol(chord, drone.register)
  const showError = chord.trim() !== '' && !voiced.valid

  return (
    <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl bg-zinc-900 p-5">
      <label className="flex cursor-pointer items-center gap-2 font-medium">
        <input
          type="checkbox"
          checked={drone.enabled}
          onChange={(e) => updateDrone({ enabled: e.target.checked })}
          className="h-4 w-4 accent-violet-500"
        />
        Chord drone
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-400">Chord</span>
        <input
          type="text"
          value={chord}
          onChange={(e) => setChord(e.target.value)}
          placeholder="e.g. Cmaj7, G7b9, D/F#"
          className={`${selectClass} ${showError ? 'ring-2 ring-red-500' : ''}`}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <span className="h-5 text-xs">
          {showError ? (
            <span className="text-red-400">Unrecognized chord symbol</span>
          ) : (
            <span className="text-zinc-500">{voiced.notes.join(' · ')}</span>
          )}
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
