// Zustand store: the single source of UI-facing state. It mirrors the metronome
// config and transport position, and forwards every change to the AudioEngine
// (which owns the actual Web Audio graph). The engine pushes position updates
// back via onPosition().

import { create } from 'zustand'
import { audioEngine } from '../audio/AudioEngine'
import { START_POSITION, type BeatPosition } from '../audio/transport'
import {
  MAX_BPM,
  MIN_BPM,
  defaultMetronomeConfig,
  resizeAccents,
  type AccentLevel,
  type MetronomeConfig,
  type TimeSignature,
} from './types'

const ACCENT_CYCLE: AccentLevel[] = ['strong', 'normal', 'soft', 'muted']
const INITIAL_BPM = 120
const INITIAL_TS: TimeSignature = { beatsPerBar: 4, beatUnit: 4 }

export function clampBpm(n: number): number {
  if (Number.isNaN(n)) return MIN_BPM
  return Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(n)))
}

interface AppState {
  bpm: number
  timeSignature: TimeSignature
  metronome: MetronomeConfig
  isPlaying: boolean
  position: BeatPosition

  play: () => void
  stop: () => void
  toggle: () => void
  setBpm: (bpm: number) => void
  setTimeSignature: (ts: TimeSignature) => void
  setSubdivision: (n: number) => void
  cycleAccent: (beatIndex: number) => void
  setSoundId: (id: string) => void
  setVolume: (v: number) => void
  setSubdivisionVolume: (v: number) => void
}

export const useStore = create<AppState>((set, get) => {
  const initialConfig = defaultMetronomeConfig(INITIAL_TS.beatsPerBar)

  // Prime the engine with the initial config and wire position updates back.
  audioEngine.setBpm(INITIAL_BPM)
  audioEngine.setTimeSignature(INITIAL_TS)
  audioEngine.setConfig(initialConfig)
  audioEngine.onPosition((position, isPlaying) => set({ position, isPlaying }))

  /** Apply a metronome-config change to both the engine and the store. */
  const applyConfig = (patch: Partial<MetronomeConfig>) => {
    const metronome = { ...get().metronome, ...patch }
    audioEngine.setConfig(metronome)
    set({ metronome })
  }

  return {
    bpm: INITIAL_BPM,
    timeSignature: INITIAL_TS,
    metronome: initialConfig,
    isPlaying: false,
    position: START_POSITION,

    play: () => void audioEngine.start(),
    stop: () => audioEngine.stop(),
    toggle: () => (get().isPlaying ? get().stop() : get().play()),

    setBpm: (bpm) => {
      const value = clampBpm(bpm)
      audioEngine.setBpm(value)
      set({ bpm: value })
    },

    setTimeSignature: (ts) => {
      const accents = resizeAccents(get().metronome.accents, ts.beatsPerBar)
      const metronome = { ...get().metronome, accents }
      audioEngine.setTimeSignature(ts)
      audioEngine.setConfig(metronome)
      set({ timeSignature: ts, metronome })
    },

    setSubdivision: (n) => applyConfig({ subdivision: n }),

    cycleAccent: (beatIndex) => {
      const accents = [...get().metronome.accents]
      const current = accents[beatIndex] ?? 'normal'
      const next =
        ACCENT_CYCLE[(ACCENT_CYCLE.indexOf(current) + 1) % ACCENT_CYCLE.length]
      accents[beatIndex] = next
      applyConfig({ accents })
    },

    setSoundId: (id) => applyConfig({ soundId: id }),
    setVolume: (v) => applyConfig({ volume: v }),
    setSubdivisionVolume: (v) => applyConfig({ subdivisionVolume: v }),
  }
})
