// Core domain types for the metronome app.
//
// `Song` is the full persisted shape (used across all phases). Phase 1 exercises
// `bpm`, `timeSignature`, and `metronome`; the drone / sections / chord types are
// defined here now so the model is stable, even though later phases populate them.

export type RegisterOption = 'low' | 'mid' | 'high'
export type Waveform = 'sine' | 'triangle' | 'sawtooth'

/** Per-beat emphasis. `muted` produces no click on that beat. */
export type AccentLevel = 'strong' | 'normal' | 'soft' | 'muted'

export interface TimeSignature {
  /** Number of beats (clicks) per bar — the top number. */
  beatsPerBar: number
  /** Note value of one beat — the bottom number (4 = quarter, 8 = eighth). */
  beatUnit: number
}

export interface MetronomeConfig {
  /** One accent level per beat; length must equal `timeSignature.beatsPerBar`. */
  accents: AccentLevel[]
  /** Notes per beat: 1 = quarter, 2 = eighth, 3 = triplet, 4 = sixteenth. */
  subdivision: number
  /** Id of the click sound from the sound bank. */
  soundId: string
  /** Relative level (0..1) of subdivision ticks vs. the main beat. */
  subdivisionVolume: number
  /** Master click volume (0..1). */
  volume: number
}

export interface GapTrainer {
  enabled: boolean
  /** Bars audible before muting. */
  playBars: number
  /** Bars muted (click only; the bar count keeps running). */
  muteBars: number
  mode: 'fixed' | 'random'
  /** Probability (0..1) a bar is muted when `mode === 'random'`. */
  randomMutePct?: number
}

export interface TempoAutomation {
  enabled: boolean
  /** BPM added at each step. */
  increment: number
  /** Step interval, in bars. */
  everyBars: number
  /** Ceiling BPM. */
  maxBpm: number
}

export interface ChordSpan {
  id: string
  /** Chord symbol, e.g. "Cmaj7", "G7b9", "D/F#". */
  symbol: string
  /** Duration in bars (>= 1). */
  bars: number
  meterOverride?: TimeSignature
}

export interface Section {
  id: string
  name: string
  /** Play count (>= 1). */
  repeats: number
  chords: ChordSpan[]
}

export interface DroneConfig {
  enabled: boolean
  register: RegisterOption
  waveform: Waveform
  volume: number
}

export interface Song {
  id: string
  name: string
  bpm: number
  timeSignature: TimeSignature
  metronome: MetronomeConfig
  gapTrainer: GapTrainer
  tempoAutomation: TempoAutomation
  sections: Section[]
  drone: DroneConfig
}

// --- Tempo / position bounds -------------------------------------------------

export const MIN_BPM = 20
export const MAX_BPM = 300

/** Allowed subdivisions (notes per beat) with display labels. */
export const SUBDIVISIONS: { value: number; label: string }[] = [
  { value: 1, label: 'Quarter' },
  { value: 2, label: 'Eighth' },
  { value: 3, label: 'Triplet' },
  { value: 4, label: 'Sixteenth' },
]

/** Common time-signature presets, including odd and compound meters. */
export const TIME_SIGNATURE_PRESETS: TimeSignature[] = [
  { beatsPerBar: 2, beatUnit: 4 },
  { beatsPerBar: 3, beatUnit: 4 },
  { beatsPerBar: 4, beatUnit: 4 },
  { beatsPerBar: 5, beatUnit: 4 },
  { beatsPerBar: 5, beatUnit: 8 },
  { beatsPerBar: 6, beatUnit: 8 },
  { beatsPerBar: 7, beatUnit: 8 },
  { beatsPerBar: 12, beatUnit: 8 },
]

// --- Defaults ----------------------------------------------------------------

/** Build a default accent pattern: strong downbeat, the rest normal. */
export function defaultAccents(beatsPerBar: number): AccentLevel[] {
  return Array.from({ length: beatsPerBar }, (_, i) =>
    i === 0 ? 'strong' : 'normal',
  )
}

/**
 * Resize an accent pattern to a new bar length, preserving existing values and
 * filling new beats with `normal`. Guarantees a strong downbeat if none exists.
 */
export function resizeAccents(
  accents: AccentLevel[],
  beatsPerBar: number,
): AccentLevel[] {
  const next = Array.from(
    { length: beatsPerBar },
    (_, i): AccentLevel => accents[i] ?? 'normal',
  )
  if (next.length > 0 && !next.includes('strong')) next[0] = 'strong'
  return next
}

export function defaultMetronomeConfig(beatsPerBar: number): MetronomeConfig {
  return {
    accents: defaultAccents(beatsPerBar),
    subdivision: 1,
    soundId: 'beep',
    subdivisionVolume: 0.5,
    volume: 0.8,
  }
}
