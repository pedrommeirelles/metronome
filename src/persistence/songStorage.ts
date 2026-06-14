// Silent persistence: the current working song is auto-saved to localStorage on
// change and restored on startup (no UI — see the store's subscription). A
// defensive coercer tolerates missing/odd fields by merging with defaults, so
// older saves still load instead of throwing.

import { newId } from '../state/ids'
import {
  defaultDroneConfig,
  defaultGapTrainer,
  defaultMetronomeConfig,
  defaultTempoAutomation,
  resizeAccents,
  type AccentLevel,
  type ChordSpan,
  type Section,
  type Song,
  type Waveform,
} from '../state/types'

const STORAGE_KEY = 'metronome.song.v1'

const ACCENTS: AccentLevel[] = ['strong', 'normal', 'soft', 'muted']
const WAVEFORMS: Waveform[] = ['sine', 'triangle', 'sawtooth']

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Math.round(num(value, fallback))
  return Math.max(min, Math.min(max, n))
}

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function oneOf<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

function coerceChord(raw: unknown): ChordSpan {
  const r = (raw ?? {}) as Record<string, unknown>
  return {
    id: str(r.id, newId()),
    symbol: str(r.symbol, 'C'),
    bars: clampInt(r.bars, 1, 64, 2),
  }
}

function coerceSection(raw: unknown): Section {
  const r = (raw ?? {}) as Record<string, unknown>
  const chords = Array.isArray(r.chords) ? r.chords.map(coerceChord) : []
  return {
    id: str(r.id, newId()),
    name: str(r.name, 'Part'),
    repeats: clampInt(r.repeats, 1, 32, 1),
    chords: chords.length > 0 ? chords : [coerceChord(null)],
  }
}

function coerceSong(raw: unknown): Song | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const ts = (r.timeSignature ?? {}) as Record<string, unknown>
  const beatsPerBar = clampInt(ts.beatsPerBar, 1, 16, 4)
  const beatUnit = clampInt(ts.beatUnit, 1, 16, 4)

  const m = (r.metronome ?? {}) as Record<string, unknown>
  const base = defaultMetronomeConfig(beatsPerBar)
  const rawAccents = Array.isArray(m.accents)
    ? m.accents.map((a) => oneOf(a, ACCENTS, 'normal'))
    : base.accents

  const g = (r.gapTrainer ?? {}) as Record<string, unknown>
  const t = (r.tempoAutomation ?? {}) as Record<string, unknown>
  const d = (r.drone ?? {}) as Record<string, unknown>
  const gapDefaults = defaultGapTrainer()
  const tempoDefaults = defaultTempoAutomation()
  const droneDefaults = defaultDroneConfig()

  return {
    id: str(r.id, newId()),
    name: str(r.name, 'Untitled'),
    bpm: clampInt(r.bpm, 20, 300, 120),
    timeSignature: { beatsPerBar, beatUnit },
    metronome: {
      accents: resizeAccents(rawAccents, beatsPerBar),
      subdivision: clampInt(m.subdivision, 1, 4, base.subdivision),
      soundId: str(m.soundId, base.soundId),
      subdivisionVolume: num(m.subdivisionVolume, base.subdivisionVolume),
      volume: num(m.volume, base.volume),
    },
    gapTrainer: {
      enabled: bool(g.enabled, gapDefaults.enabled),
      playBars: clampInt(g.playBars, 1, 32, gapDefaults.playBars),
      muteBars: clampInt(g.muteBars, 1, 32, gapDefaults.muteBars),
      mode: oneOf(g.mode, ['fixed', 'random'], gapDefaults.mode),
      randomMutePct: num(g.randomMutePct, gapDefaults.randomMutePct ?? 0.5),
    },
    tempoAutomation: {
      enabled: bool(t.enabled, tempoDefaults.enabled),
      increment: clampInt(t.increment, 1, 50, tempoDefaults.increment),
      everyBars: clampInt(t.everyBars, 1, 64, tempoDefaults.everyBars),
      maxBpm: clampInt(t.maxBpm, 20, 300, tempoDefaults.maxBpm),
    },
    drone: {
      enabled: bool(d.enabled, droneDefaults.enabled),
      register: oneOf(d.register, ['low', 'mid', 'high'], droneDefaults.register),
      waveform: oneOf(d.waveform, WAVEFORMS, droneDefaults.waveform),
      volume: num(d.volume, droneDefaults.volume),
    },
    sections: Array.isArray(r.sections) ? r.sections.map(coerceSection) : [],
  }
}

export function saveSong(song: Song): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(song))
  } catch {
    // Storage may be unavailable (private mode, quota) — saving is best-effort.
  }
}

export function loadSong(): Song | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return coerceSong(JSON.parse(raw))
  } catch {
    return null
  }
}
