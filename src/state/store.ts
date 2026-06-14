// Zustand store: the single source of UI-facing state. It mirrors the metronome
// config, trainer settings, drone config, and the chord progression, forwarding
// every change to the AudioEngine (which owns the Web Audio graph). The engine
// pushes position, tempo, and current-chord updates back via its subscriptions.

import { create } from 'zustand'
import { audioEngine } from '../audio/AudioEngine'
import { START_POSITION, type BeatPosition } from '../audio/transport'
import { newId } from './ids'
import {
  MAX_BPM,
  MIN_BPM,
  defaultDroneConfig,
  defaultGapTrainer,
  defaultMetronomeConfig,
  defaultTempoAutomation,
  resizeAccents,
  type AccentLevel,
  type ChordSpan,
  type DroneConfig,
  type GapTrainer,
  type MetronomeConfig,
  type Section,
  type TempoAutomation,
  type TimeSignature,
} from './types'

const ACCENT_CYCLE: AccentLevel[] = ['strong', 'normal', 'soft', 'muted']
const INITIAL_BPM = 120
const INITIAL_TS: TimeSignature = { beatsPerBar: 4, beatUnit: 4 }

/** A small demo progression so the harmonic feature is visible on first load. */
function seedProgression(): Section[] {
  return [
    {
      id: newId(),
      name: 'A',
      repeats: 1,
      chords: [
        { id: newId(), symbol: 'Cmaj7', bars: 2 },
        { id: newId(), symbol: 'A7', bars: 2 },
        { id: newId(), symbol: 'Dm7', bars: 2 },
        { id: newId(), symbol: 'G7', bars: 2 },
      ],
    },
  ]
}

function newChord(): ChordSpan {
  return { id: newId(), symbol: 'C', bars: 2 }
}

function newSection(name: string): Section {
  return { id: newId(), name, repeats: 1, chords: [newChord()] }
}

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
  drone: DroneConfig
  sections: Section[]
  isPlaying: boolean
  position: BeatPosition
  /** Whether the current bar's click is muted by the gap trainer. */
  barMuted: boolean
  /** The chord the drone is currently sounding (synced to audio time). */
  currentChord: string | null

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
  updateDrone: (patch: Partial<DroneConfig>) => void

  // Progression editing
  addSection: () => void
  removeSection: (sectionId: string) => void
  updateSection: (sectionId: string, patch: Partial<Omit<Section, 'chords'>>) => void
  moveSection: (sectionId: string, dir: -1 | 1) => void
  addChord: (sectionId: string) => void
  removeChord: (sectionId: string, chordId: string) => void
  updateChord: (sectionId: string, chordId: string, patch: Partial<ChordSpan>) => void
  moveChord: (sectionId: string, chordId: string, dir: -1 | 1) => void
}

function moveItem<T>(items: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir
  if (index < 0 || target < 0 || target >= items.length) return items
  const next = [...items]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export const useStore = create<AppState>((set, get) => {
  const initialConfig = defaultMetronomeConfig(INITIAL_TS.beatsPerBar)
  const initialGap = defaultGapTrainer()
  const initialTempo = defaultTempoAutomation()
  const initialDrone = defaultDroneConfig()
  const initialSections = seedProgression()

  // Prime the engine with the initial config and wire updates back.
  audioEngine.setBpm(INITIAL_BPM)
  audioEngine.setTimeSignature(INITIAL_TS)
  audioEngine.setConfig(initialConfig)
  audioEngine.setGapTrainer(initialGap)
  audioEngine.setTempoAutomation(initialTempo)
  audioEngine.setDroneConfig(initialDrone)
  audioEngine.setProgression(initialSections)
  audioEngine.onPosition((position, isPlaying, barMuted) =>
    set({ position, isPlaying, barMuted }),
  )
  audioEngine.onBpm((bpm) => set({ bpm }))
  audioEngine.onChord((currentChord) => set({ currentChord }))

  const applyConfig = (patch: Partial<MetronomeConfig>) => {
    const metronome = { ...get().metronome, ...patch }
    audioEngine.setConfig(metronome)
    set({ metronome })
  }

  /** Commit edited sections to both the engine and the store. */
  const applySections = (sections: Section[]) => {
    audioEngine.setProgression(sections)
    set({ sections })
  }

  /** Edit one section immutably by id. */
  const editSection = (sectionId: string, fn: (s: Section) => Section) => {
    applySections(
      get().sections.map((s) => (s.id === sectionId ? fn(s) : s)),
    )
  }

  return {
    bpm: INITIAL_BPM,
    timeSignature: INITIAL_TS,
    metronome: initialConfig,
    gapTrainer: initialGap,
    tempoAutomation: initialTempo,
    drone: initialDrone,
    sections: initialSections,
    isPlaying: false,
    position: START_POSITION,
    barMuted: false,
    currentChord: null,

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

    updateDrone: (patch) => {
      const drone = { ...get().drone, ...patch }
      audioEngine.setDroneConfig(drone)
      set({ drone })
    },

    addSection: () =>
      applySections([
        ...get().sections,
        newSection(`Part ${get().sections.length + 1}`),
      ]),

    removeSection: (sectionId) =>
      applySections(get().sections.filter((s) => s.id !== sectionId)),

    updateSection: (sectionId, patch) =>
      editSection(sectionId, (s) => ({ ...s, ...patch })),

    moveSection: (sectionId, dir) => {
      const index = get().sections.findIndex((s) => s.id === sectionId)
      applySections(moveItem(get().sections, index, dir))
    },

    addChord: (sectionId) =>
      editSection(sectionId, (s) => ({
        ...s,
        chords: [...s.chords, newChord()],
      })),

    removeChord: (sectionId, chordId) =>
      editSection(sectionId, (s) => ({
        ...s,
        chords: s.chords.filter((c) => c.id !== chordId),
      })),

    updateChord: (sectionId, chordId, patch) =>
      editSection(sectionId, (s) => ({
        ...s,
        chords: s.chords.map((c) =>
          c.id === chordId ? { ...c, ...patch } : c,
        ),
      })),

    moveChord: (sectionId, chordId, dir) =>
      editSection(sectionId, (s) => {
        const index = s.chords.findIndex((c) => c.id === chordId)
        return { ...s, chords: moveItem(s.chords, index, dir) }
      }),
  }
})
