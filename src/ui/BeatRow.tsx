// Visual metronome + accent editor in one. Each beat is a button: its colour
// shows the accent level, tapping it cycles the accent, and the active beat
// pulses in time with the audio.

import { useStore } from '../state/store'
import type { AccentLevel } from '../state/types'

const ACCENT_STYLE: Record<AccentLevel, string> = {
  strong: 'bg-amber-400 border-amber-300',
  normal: 'bg-sky-500 border-sky-400',
  soft: 'bg-sky-800 border-sky-700',
  muted: 'bg-zinc-800 border-zinc-700',
}

const ACCENT_LABEL: Record<AccentLevel, string> = {
  strong: 'Strong',
  normal: 'Normal',
  soft: 'Soft',
  muted: 'Muted',
}

export function BeatRow() {
  const accents = useStore((s) => s.metronome.accents)
  const isPlaying = useStore((s) => s.isPlaying)
  const beatInBar = useStore((s) => s.position.beatInBar)
  const barMuted = useStore((s) => s.barMuted)
  const cycleAccent = useStore((s) => s.cycleAccent)

  const muting = isPlaying && barMuted

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`text-xs font-semibold uppercase tracking-widest transition-opacity ${
          muting ? 'text-amber-400 opacity-100' : 'opacity-0'
        }`}
      >
        Muted — keep the time
      </div>
      <div
        className={`flex flex-wrap items-end justify-center gap-3 transition-opacity ${
          muting ? 'opacity-30' : 'opacity-100'
        }`}
      >
        {accents.map((level, i) => {
          const active = isPlaying && beatInBar === i
          return (
            <button
              key={i}
              type="button"
              onClick={() => cycleAccent(i)}
              title={`Beat ${i + 1}: ${ACCENT_LABEL[level]} (tap to change)`}
              className={[
                'flex h-16 w-16 flex-col items-center justify-center rounded-xl border-2 font-semibold text-zinc-950 transition-transform duration-75',
                ACCENT_STYLE[level],
                active ? 'scale-110 ring-4 ring-white/70' : 'scale-100',
                level === 'muted' ? 'text-zinc-500' : '',
              ].join(' ')}
            >
              <span className="text-lg">{i + 1}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
