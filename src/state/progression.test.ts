import { describe, expect, it } from 'vitest'
import {
  buildTimeline,
  chordAtBar,
  nextChordSymbol,
} from './progression'
import type { Section } from './types'

const sections: Section[] = [
  {
    id: 's1',
    name: 'A',
    repeats: 2,
    chords: [
      { id: 'c1', symbol: 'Cmaj7', bars: 2 },
      { id: 'c2', symbol: 'A7', bars: 1 },
    ],
  },
  {
    id: 's2',
    name: 'B',
    repeats: 1,
    chords: [{ id: 'c3', symbol: 'Dm7', bars: 1 }],
  },
]

describe('buildTimeline', () => {
  it('expands repeats and bar counts', () => {
    const tl = buildTimeline(sections)
    // A repeated 2x: (Cmaj7 x2 + A7 x1) = 3 bars * 2 = 6; B: 1 → total 7
    expect(tl.totalBars).toBe(7)
    expect(tl.bars.map((b) => b.symbol)).toEqual([
      'Cmaj7',
      'Cmaj7',
      'A7',
      'Cmaj7',
      'Cmaj7',
      'A7',
      'Dm7',
    ])
  })

  it('is empty for no sections', () => {
    expect(buildTimeline([]).totalBars).toBe(0)
  })
})

describe('chordAtBar', () => {
  it('looks up and loops over the song', () => {
    const tl = buildTimeline(sections)
    expect(chordAtBar(tl, 0)?.symbol).toBe('Cmaj7')
    expect(chordAtBar(tl, 2)?.symbol).toBe('A7')
    expect(chordAtBar(tl, 6)?.symbol).toBe('Dm7')
    expect(chordAtBar(tl, 7)?.symbol).toBe('Cmaj7') // wraps
    expect(chordAtBar(tl, 9)?.symbol).toBe('A7')
  })

  it('returns null for an empty timeline', () => {
    expect(chordAtBar(buildTimeline([]), 0)).toBeNull()
  })
})

describe('nextChordSymbol', () => {
  it('finds the next distinct chord, wrapping around', () => {
    const tl = buildTimeline(sections)
    expect(nextChordSymbol(tl, 0)).toBe('A7') // bar 0,1 Cmaj7 -> A7
    expect(nextChordSymbol(tl, 2)).toBe('Cmaj7') // A7 -> Cmaj7
    expect(nextChordSymbol(tl, 6)).toBe('Cmaj7') // Dm7 -> wrap to Cmaj7
  })

  it('returns null when only one chord exists', () => {
    const tl = buildTimeline([
      { id: 's', name: 'A', repeats: 1, chords: [{ id: 'c', symbol: 'C', bars: 4 }] },
    ])
    expect(nextChordSymbol(tl, 0)).toBeNull()
  })
})
