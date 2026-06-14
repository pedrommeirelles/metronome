// Now-playing display: current section, current chord (large), and next chord.
// Derived from the progression timeline at the audio-synced bar position.

import { useMemo } from 'react'
import { useStore } from '../state/store'
import {
  buildTimeline,
  chordAtBar,
  nextChordSymbol,
} from '../state/progression'

export function NowPlaying() {
  const sections = useStore((s) => s.sections)
  const barCount = useStore((s) => s.position.barCount)

  const timeline = useMemo(() => buildTimeline(sections), [sections])

  // Negative bar = count-in (before the progression starts).
  if (barCount < 0) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs uppercase tracking-widest text-zinc-500">
          Count-in
        </span>
        <span className="text-5xl font-bold tracking-tight text-zinc-500">
          {-barCount}
        </span>
      </div>
    )
  }

  if (timeline.totalBars === 0) {
    return (
      <div className="text-center text-zinc-600">
        Add a chord below to start the progression.
      </div>
    )
  }

  const current = chordAtBar(timeline, barCount)
  const next = nextChordSymbol(timeline, barCount)

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs uppercase tracking-widest text-zinc-500">
        {current?.sectionName ?? '—'}
      </span>
      <span className="text-5xl font-bold tracking-tight text-violet-300">
        {current?.symbol ?? '—'}
      </span>
      {next && (
        <span className="text-sm text-zinc-500">next: {next}</span>
      )}
    </div>
  )
}
