// Transport: play/stop, BPM (number + slider + nudge), and tap tempo.

import { useRef } from 'react'
import { useStore } from '../state/store'
import { MAX_BPM, MIN_BPM } from '../state/types'

const TAP_RESET_MS = 2000 // a gap longer than this starts a fresh tap series
const MAX_TAPS = 5

export function TransportControls() {
  const bpm = useStore((s) => s.bpm)
  const isPlaying = useStore((s) => s.isPlaying)
  const toggle = useStore((s) => s.toggle)
  const setBpm = useStore((s) => s.setBpm)

  const taps = useRef<number[]>([])

  const tapTempo = () => {
    const now = performance.now()
    const last = taps.current[taps.current.length - 1]
    if (last !== undefined && now - last > TAP_RESET_MS) taps.current = []
    taps.current.push(now)
    if (taps.current.length > MAX_TAPS) taps.current.shift()
    if (taps.current.length >= 2) {
      const first = taps.current[0]
      const intervals = taps.current.length - 1
      const avgMs = (now - first) / intervals
      setBpm(60000 / avgMs)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          className={`h-14 w-32 rounded-full text-lg font-semibold transition-colors ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-400 text-white'
              : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
          }`}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>

        <button
          type="button"
          onClick={tapTempo}
          className="h-14 w-28 rounded-full bg-zinc-800 text-base font-medium text-zinc-100 hover:bg-zinc-700"
        >
          Tap
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setBpm(bpm - 1)}
          className="h-9 w-9 rounded-full bg-zinc-800 text-xl leading-none hover:bg-zinc-700"
          aria-label="Decrease tempo"
        >
          −
        </button>
        <div className="flex flex-col items-center">
          <span className="text-5xl font-bold tabular-nums">{bpm}</span>
          <span className="text-xs uppercase tracking-widest text-zinc-500">
            BPM
          </span>
        </div>
        <button
          type="button"
          onClick={() => setBpm(bpm + 1)}
          className="h-9 w-9 rounded-full bg-zinc-800 text-xl leading-none hover:bg-zinc-700"
          aria-label="Increase tempo"
        >
          +
        </button>
      </div>

      <input
        type="range"
        min={MIN_BPM}
        max={MAX_BPM}
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
        className="w-72 accent-emerald-500"
        aria-label="Tempo"
      />
    </div>
  )
}
