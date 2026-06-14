// Library picker: choose a built-in progression/standard to load into the
// editor. Replaces personal save/load — the library is how you start a song.

import { LIBRARY, LIBRARY_CATEGORIES } from '../data/presets'
import { useStore } from '../state/store'

export function LibraryPicker() {
  const name = useStore((s) => s.name)
  const loadPreset = useStore((s) => s.loadPreset)

  return (
    <div className="flex w-full max-w-xl flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-widest text-zinc-500">
          Loaded
        </div>
        <div className="truncate text-lg font-semibold">{name}</div>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-400">Load from library</span>
        <select
          value=""
          onChange={(e) => {
            const preset = LIBRARY.find((p) => p.id === e.target.value)
            if (preset) loadPreset(preset)
          }}
          className="rounded-lg bg-zinc-800 px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="" disabled>
            Choose a progression…
          </option>
          {LIBRARY_CATEGORIES.map((category) => (
            <optgroup key={category} label={category}>
              {LIBRARY.filter((p) => p.category === category).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.bpm} BPM
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
    </div>
  )
}
