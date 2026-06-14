import { describe, expect, it } from 'vitest'
import { voiceChordSymbol } from './chordEngine'

describe('voiceChordSymbol', () => {
  it('voices a maj7 ascending from the mid register', () => {
    const v = voiceChordSymbol('Cmaj7', 'mid')
    expect(v.valid).toBe(true)
    expect(v.notes).toEqual(['C3', 'E3', 'G3', 'B3'])
    expect(v.frequencies[0]).toBeCloseTo(130.81, 1)
  })

  it('places the slash bass on the bottom', () => {
    const v = voiceChordSymbol('D/F#', 'mid')
    expect(v.valid).toBe(true)
    expect(v.notes[0]).toBe('F#3')
    // ascending stack: F#3 < A3 < D4
    expect(v.frequencies[0]).toBeLessThan(v.frequencies[1])
    expect(v.frequencies[1]).toBeLessThan(v.frequencies[2])
  })

  it('handles altered dominants', () => {
    const v = voiceChordSymbol('G7b9', 'mid')
    expect(v.valid).toBe(true)
    expect(v.notes.length).toBe(5) // G B D F Ab
  })

  it('shifts octave with the register', () => {
    expect(voiceChordSymbol('C', 'low').notes[0]).toBe('C2')
    expect(voiceChordSymbol('C', 'mid').notes[0]).toBe('C3')
    expect(voiceChordSymbol('C', 'high').notes[0]).toBe('C4')
  })

  it('produces strictly ascending frequencies', () => {
    const { frequencies } = voiceChordSymbol('C13', 'mid')
    for (let i = 1; i < frequencies.length; i++) {
      expect(frequencies[i]).toBeGreaterThan(frequencies[i - 1])
    }
  })

  it('marks an unparseable symbol invalid', () => {
    const v = voiceChordSymbol('xyz', 'mid')
    expect(v.valid).toBe(false)
    expect(v.frequencies).toEqual([])
  })

  it('treats an empty string as invalid', () => {
    expect(voiceChordSymbol('   ', 'mid').valid).toBe(false)
  })
})
