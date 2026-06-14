// Zustand store: the single source of UI-facing state. It mirrors the metronome
// config, trainer settings, and transport position, forwarding every change to
// the AudioEngine (which owns the actual Web Audio graph). The engine pushes
// position and effective-tempo updates back via onPosition()/onBpm().

import { create } from 'zustand'
import { audioEngine } from '../audio/AudioEngine'
import { START_POSITION, type BeatPosition } from '../audio/transport'
import {
  MAX_BPM,
  MIN_BPM,
  defaultGapTrainer,
  defaultMetronomeConfig,
  defaultTempoAutomation,
  resizeAccents,
  type AccentLevel,
  type GapTrainer,
  type MetronomeConfig,
  type TempoAutomation,
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
  gapTrainer: GapTrainer
  tempoAutomation: TempoAutomation
  isPlaying: boolean
  position: BeatPosition
  /** Whether the current bar's click is muted by the gap trainer. */
  barMuted: boolean

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
  updateGapTrainer: (patch: Partial<GapTrainer>) => void
  updateTempoAutomation: (patch: Partial<TempoAutomation>) => void
}

export const useStore = create<AppState>((set, get) => {
  const initialConfig = defaultMetronomeConfig(INITIAL_TS.beatsPerBar)
  const initialGap = defaultGapTrainer()
  const initialTempo = defaultTempoAutomation()

  // Prime the engine with the initial config and wire updates back.
  audioEngine.setBpm(INITIAL_BPM)
  audioEngine.setTimeSignature(INITIAL_TS)
  audioEngine.setConfig(initialConfig)
  audioEngine.setGapTrainer(initialGap)
  audioEngine.setTempoAutomation(initialTempo)
  audioEngine.onPosition((position, isPlaying, barMuted) =>
    set({ position, isPlaying, barMuted }),
  )
  audioEngine.onBpm((bpm) => set({ bpm }))

  const applyConfig = (patch: Partial<MetronomeConfig>) => {
    const metronome = { ...get().metronome, ...patch }
    audioEngine.setConfig(metronome)
    set({ metronome })
  }

  return {
    bpm: INITIAL_BPM,
    timeSignature: INITIAL_TS,
    metronome: initialConfig,
    gapTrainer: initialGap,
    tempoAutomation: initialTempo,
    isPlaying: false,
    position: START_POSITION,
    barMuted: false,

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

    updateGapTrainer: (patch) => {
      const gapTrainer = { ...get().gapTrainer, ...patch }
      audioEngine.setGapTrainer(gapTrainer)
      set({ gapTrainer })
    },

    updateTempoAutomation: (patch) => {
      const tempoAutomation = { ...get().tempoAutomation, ...patch }
      audioEngine.setTempoAutomation(tempoAutomation)
      set({ tempoAutomation })
    },
  }
})
