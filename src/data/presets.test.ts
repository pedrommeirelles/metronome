import { describe, expect, it } from 'vitest'
import { voiceChordSymbol } from '../audio/chordEngine'
import { LIBRARY, LIBRARY_CATEGORIES } from './presets'

describe('preset library', () => {
  it('has unique ids', () => {
    const ids = LIBRARY.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('uses known categories and sensible tempos', () => {
    for (const p of LIBRARY) {
      expect(LIBRARY_CATEGORIES).toContain(p.category)
      expect(p.bpm).toBeGreaterThanOrEqual(20)
      expect(p.bpm).toBeLessThanOrEqual(300)
    }
  })

  it('every chord parses and every bar count is >= 1', () => {
    for (const p of LIBRARY) {
      expect(p.sections.length).toBeGreaterThan(0)
      for (const section of p.sections) {
        expect(section.chords.length).toBeGreaterThan(0)
        expect(section.repeats).toBeGreaterThanOrEqual(1)
        for (const chord of section.chords) {
          expect(chord.bars).toBeGreaterThanOrEqual(1)
          expect(
            voiceChordSymbol(chord.symbol, 'mid').valid,
            `${p.name}: "${chord.symbol}"`,
          ).toBe(true)
        }
      }
    }
  })
})
