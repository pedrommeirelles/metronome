// Chord engine: chord symbol -> voiced notes -> frequencies.
//
// Uses Tonal.js for the music theory (full jazz extensions, alterations, and
// slash chords — Tonal already orders a slash chord's bass note first). We then
// voice the pitch classes as an ascending stack from a register-dependent base
// octave and convert to equal-temperament frequencies (A4 = 440). Pure and
// unit-tested; no Web Audio here.

import { Chord, Note } from 'tonal'
import type { RegisterOption } from '../state/types'

export interface VoicedChord {
  symbol: string
  valid: boolean
  /** Voiced note names with octave, e.g. ["C3","E3","G3","B3"]. */
  notes: string[]
  frequencies: number[]
}

const REGISTER_OCTAVE: Record<RegisterOption, number> = {
  low: 2,
  mid: 3,
  high: 4,
}

/** Stack pitch classes ascending from `baseOctave`, each note above the last. */
function voiceAscending(pitchClasses: string[], baseOctave: number): string[] {
  const out: string[] = []
  let prevMidi = -Infinity
  for (const pc of pitchClasses) {
    let octave = baseOctave
    let name = `${pc}${octave}`
    let midi = Note.midi(name)
    while (midi !== null && midi <= prevMidi) {
      octave += 1
      name = `${pc}${octave}`
      midi = Note.midi(name)
    }
    out.push(name)
    if (midi !== null) prevMidi = midi
  }
  return out
}

export function voiceChordSymbol(
  symbol: string,
  register: RegisterOption,
): VoicedChord {
  const trimmed = symbol.trim()
  const chord = Chord.get(trimmed)
  if (trimmed === '' || chord.empty || chord.notes.length === 0) {
    return { symbol: trimmed, valid: false, notes: [], frequencies: [] }
  }
  const notes = voiceAscending(chord.notes, REGISTER_OCTAVE[register])
  const frequencies = notes
    .map((n) => Note.freq(n))
    .filter((f): f is number => typeof f === 'number')
  return { symbol: trimmed, valid: true, notes, frequencies }
}
