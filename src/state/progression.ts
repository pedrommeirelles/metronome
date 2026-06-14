// Progression timeline: flatten sections (with repeats) into a per-bar sequence
// so "which chord at bar N" is an O(1) lookup. Playback loops over one pass of
// the song. Pure and unit-tested; the engine and UI both consume it.

import type { Section } from './types'

export interface TimelineBar {
  sectionIndex: number
  sectionName: string
  chordSpanId: string
  symbol: string
}

export interface Timeline {
  bars: TimelineBar[]
  totalBars: number
}

export const EMPTY_TIMELINE: Timeline = { bars: [], totalBars: 0 }

export function buildTimeline(sections: Section[]): Timeline {
  const bars: TimelineBar[] = []
  sections.forEach((section, sectionIndex) => {
    const repeats = Math.max(1, section.repeats)
    for (let r = 0; r < repeats; r++) {
      for (const chord of section.chords) {
        const count = Math.max(1, chord.bars)
        for (let b = 0; b < count; b++) {
          bars.push({
            sectionIndex,
            sectionName: section.name,
            chordSpanId: chord.id,
            symbol: chord.symbol,
          })
        }
      }
    }
  })
  return { bars, totalBars: bars.length }
}

/** The bar (with its chord) at an absolute bar index, looping over the song. */
export function chordAtBar(
  timeline: Timeline,
  absoluteBar: number,
): TimelineBar | null {
  if (timeline.totalBars === 0) return null
  const index = ((absoluteBar % timeline.totalBars) + timeline.totalBars) %
    timeline.totalBars
  return timeline.bars[index]
}

/** The next distinct chord symbol after `absoluteBar`, or null if there's only one. */
export function nextChordSymbol(
  timeline: Timeline,
  absoluteBar: number,
): string | null {
  if (timeline.totalBars === 0) return null
  const current = chordAtBar(timeline, absoluteBar)?.symbol
  for (let i = 1; i <= timeline.totalBars; i++) {
    const symbol = chordAtBar(timeline, absoluteBar + i)?.symbol
    if (symbol !== current) return symbol ?? null
  }
  return null
}
