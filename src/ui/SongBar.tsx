// Song actions: name the song and save / load / start new (localStorage-backed).

import { useState } from 'react'
import { useStore } from '../state/store'

const btn =
  'rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40'

export function SongBar() {
  const name = useStore((s) => s.name)
  const setName = useStore((s) => s.setName)
  const save = useStore((s) => s.save)
  const loadSaved = useStore((s) => s.loadSaved)
  const reset = useStore((s) => s.reset)

  const [savedAt, setSavedAt] = useState(false)

  const handleSave = () => {
    save()
    setSavedAt(true)
    window.setTimeout(() => setSavedAt(false), 1500)
  }

  const handleNew = () => {
    if (window.confirm('Start a new song? Unsaved changes will be lost.')) {
      reset()
    }
  }

  return (
    <div className="flex w-full max-w-xl flex-wrap items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Song name"
        className="min-w-0 flex-1 rounded-lg bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button
        type="button"
        onClick={handleSave}
        className={`${btn} bg-emerald-600 text-white hover:bg-emerald-500`}
      >
        {savedAt ? 'Saved ✓' : 'Save'}
      </button>
      <button
        type="button"
        onClick={loadSaved}
        className={`${btn} bg-zinc-800 text-zinc-200 hover:bg-zinc-700`}
      >
        Load
      </button>
      <button
        type="button"
        onClick={handleNew}
        className={`${btn} bg-zinc-800 text-zinc-200 hover:bg-zinc-700`}
      >
        New
      </button>
    </div>
  )
}
