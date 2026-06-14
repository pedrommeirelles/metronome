// Built-in library of progressions and standards. Each preset carries a tempo,
// meter, and chord changes grouped into sections, and loads straight into the
// editor. Chords are stored without ids (generated on load) so repeats work.
//
// Note: chord progressions/changes are functional harmony and not protected the
// way melodies and lyrics are; these are practice templates (simplified to one
// chord per bar where a tune uses two-per-bar).

import type { TimeSignature } from '../state/types'

export interface PresetChord {
  symbol: string
  bars: number
}

export interface PresetSection {
  name: string
  repeats: number
  chords: PresetChord[]
}

export interface ProgressionPreset {
  id: string
  name: string
  category: string
  bpm: number
  timeSignature: TimeSignature
  sections: PresetSection[]
}

const FOUR_FOUR: TimeSignature = { beatsPerBar: 4, beatUnit: 4 }

const c = (symbol: string, bars = 1): PresetChord => ({ symbol, bars })

/** Single-section helper (the common case). */
function one(name: string, chords: PresetChord[]): PresetSection[] {
  return [{ name, repeats: 1, chords }]
}

export const LIBRARY_CATEGORIES = [
  'Blues',
  'ii–V–I & Turnarounds',
  'Rhythm Changes',
  'Modal',
  'Latin / Bossa',
  'Standards',
] as const

export const LIBRARY: ProgressionPreset[] = [
  // --- Blues ---------------------------------------------------------------
  {
    id: 'blues-f',
    name: 'Blues in F',
    category: 'Blues',
    bpm: 100,
    timeSignature: FOUR_FOUR,
    sections: one('12-bar', [
      c('F7', 4),
      c('Bb7', 2),
      c('F7', 2),
      c('C7', 1),
      c('Bb7', 1),
      c('F7', 2),
    ]),
  },
  {
    id: 'jazz-blues-bb',
    name: 'Jazz Blues in B♭',
    category: 'Blues',
    bpm: 140,
    timeSignature: FOUR_FOUR,
    sections: one('12-bar', [
      c('Bb7'),
      c('Eb7'),
      c('Bb7'),
      c('Bb7'),
      c('Eb7'),
      c('Edim7'),
      c('Bb7'),
      c('G7'),
      c('Cm7'),
      c('F7'),
      c('Bb7'),
      c('F7'),
    ]),
  },
  {
    id: 'minor-blues-c',
    name: 'Minor Blues in C',
    category: 'Blues',
    bpm: 110,
    timeSignature: FOUR_FOUR,
    sections: one('12-bar', [
      c('Cm7', 4),
      c('Fm7', 2),
      c('Cm7', 2),
      c('Ab7', 1),
      c('G7', 1),
      c('Cm7', 1),
      c('G7', 1),
    ]),
  },

  // --- ii–V–I & Turnarounds ------------------------------------------------
  {
    id: 'major-ii-v-i',
    name: 'Major ii–V–I (C)',
    category: 'ii–V–I & Turnarounds',
    bpm: 120,
    timeSignature: FOUR_FOUR,
    sections: one('ii–V–I', [c('Dm7', 2), c('G7', 2), c('Cmaj7', 4)]),
  },
  {
    id: 'minor-ii-v-i',
    name: 'Minor ii–V–i (Cm)',
    category: 'ii–V–I & Turnarounds',
    bpm: 120,
    timeSignature: FOUR_FOUR,
    sections: one('ii–V–i', [c('Dm7b5', 2), c('G7', 2), c('Cm7', 4)]),
  },
  {
    id: 'turnaround-1625',
    name: 'I–VI–ii–V Turnaround (C)',
    category: 'ii–V–I & Turnarounds',
    bpm: 130,
    timeSignature: FOUR_FOUR,
    sections: one('turnaround', [c('Cmaj7'), c('A7'), c('Dm7'), c('G7')]),
  },
  {
    id: 'coltrane-cycle',
    name: 'Coltrane Changes (major-3rd cycle)',
    category: 'ii–V–I & Turnarounds',
    bpm: 120,
    timeSignature: FOUR_FOUR,
    sections: one('cycle', [
      c('Cmaj7', 2),
      c('Eb7'),
      c('Abmaj7', 2),
      c('B7'),
      c('Emaj7', 2),
      c('G7'),
    ]),
  },

  // --- Rhythm Changes ------------------------------------------------------
  {
    id: 'rhythm-changes-a',
    name: 'Rhythm Changes — A (B♭)',
    category: 'Rhythm Changes',
    bpm: 160,
    timeSignature: FOUR_FOUR,
    sections: one('A', [
      c('Bb6'),
      c('G7'),
      c('Cm7'),
      c('F7'),
      c('Dm7'),
      c('G7'),
      c('Cm7'),
      c('F7'),
    ]),
  },

  // --- Modal ---------------------------------------------------------------
  {
    id: 'so-what',
    name: 'So What (Dorian, AABA)',
    category: 'Modal',
    bpm: 130,
    timeSignature: FOUR_FOUR,
    sections: [
      { name: 'A', repeats: 2, chords: [c('Dm7', 8)] },
      { name: 'B', repeats: 1, chords: [c('Ebm7', 8)] },
      { name: 'A', repeats: 1, chords: [c('Dm7', 8)] },
    ],
  },
  {
    id: 'dorian-vamp',
    name: 'Dorian Vamp (Dm7)',
    category: 'Modal',
    bpm: 100,
    timeSignature: FOUR_FOUR,
    sections: one('vamp', [c('Dm7', 4)]),
  },

  // --- Latin / Bossa -------------------------------------------------------
  {
    id: 'blue-bossa',
    name: 'Blue Bossa (Cm)',
    category: 'Latin / Bossa',
    bpm: 150,
    timeSignature: FOUR_FOUR,
    sections: one('16-bar', [
      c('Cm7', 2),
      c('Fm7', 2),
      c('Dm7b5'),
      c('G7'),
      c('Cm7', 2),
      c('Ebm7'),
      c('Ab7'),
      c('Dbmaj7', 2),
      c('Dm7b5'),
      c('G7'),
      c('Cm7'),
      c('G7'),
    ]),
  },

  // --- Standards -----------------------------------------------------------
  {
    id: 'autumn-leaves',
    name: 'Autumn Leaves — A (Gm)',
    category: 'Standards',
    bpm: 120,
    timeSignature: FOUR_FOUR,
    sections: one('A', [
      c('Cm7'),
      c('F7'),
      c('Bbmaj7'),
      c('Ebmaj7'),
      c('Am7b5'),
      c('D7'),
      c('Gm7', 2),
    ]),
  },
  {
    id: 'a-train',
    name: 'Take the A Train — A (C)',
    category: 'Standards',
    bpm: 160,
    timeSignature: FOUR_FOUR,
    sections: one('A', [
      c('Cmaj7', 2),
      c('D7', 2),
      c('Dm7'),
      c('G7'),
      c('Cmaj7', 2),
    ]),
  },
  {
    id: 'fly-me-to-the-moon',
    name: 'Fly Me to the Moon — A (C)',
    category: 'Standards',
    bpm: 120,
    timeSignature: FOUR_FOUR,
    sections: one('A', [
      c('Am7'),
      c('Dm7'),
      c('G7'),
      c('Cmaj7'),
      c('Fmaj7'),
      c('Bm7b5'),
      c('E7'),
      c('Am7'),
    ]),
  },
  {
    id: 'all-the-things',
    name: 'All the Things You Are — A (A♭)',
    category: 'Standards',
    bpm: 130,
    timeSignature: FOUR_FOUR,
    sections: one('A', [
      c('Fm7'),
      c('Bbm7'),
      c('Eb7'),
      c('Abmaj7'),
      c('Dbmaj7'),
      c('G7'),
      c('Cmaj7', 2),
    ]),
  },

  // --- More Blues ----------------------------------------------------------
  {
    id: 'bird-blues-f',
    name: 'Bird Blues (F)',
    category: 'Blues',
    bpm: 150,
    timeSignature: FOUR_FOUR,
    sections: one('12-bar', [
      c('Fmaj7'),
      c('Em7b5'),
      c('A7'),
      c('Dm7'),
      c('G7'),
      c('Cm7'),
      c('F7'),
      c('Bb7'),
      c('Bbm7'),
      c('Eb7'),
      c('Am7'),
      c('D7'),
    ]),
  },

  // --- More Rhythm Changes -------------------------------------------------
  {
    id: 'rhythm-changes-b',
    name: 'Rhythm Changes — Bridge (B♭)',
    category: 'Rhythm Changes',
    bpm: 160,
    timeSignature: FOUR_FOUR,
    sections: one('B', [c('D7', 2), c('G7', 2), c('C7', 2), c('F7', 2)]),
  },

  // --- More Modal ----------------------------------------------------------
  {
    id: 'cantaloupe-island',
    name: 'Cantaloupe Island',
    category: 'Modal',
    bpm: 110,
    timeSignature: FOUR_FOUR,
    sections: one('vamp', [c('Fm7', 4), c('Db7', 4), c('Dm7', 4), c('Fm7', 4)]),
  },

  // --- More Latin / Bossa --------------------------------------------------
  {
    id: 'ipanema-a',
    name: 'The Girl from Ipanema — A (F)',
    category: 'Latin / Bossa',
    bpm: 130,
    timeSignature: FOUR_FOUR,
    sections: one('A', [
      c('Fmaj7', 2),
      c('G7', 2),
      c('Gm7'),
      c('Gb7'),
      c('Fmaj7', 2),
    ]),
  },
  {
    id: 'black-orpheus-a',
    name: 'Black Orpheus — A (Am)',
    category: 'Latin / Bossa',
    bpm: 140,
    timeSignature: FOUR_FOUR,
    sections: one('A', [
      c('Am7'),
      c('Bm7b5'),
      c('E7'),
      c('Am7'),
      c('Dm7'),
      c('Bm7b5'),
      c('E7'),
      c('Am7'),
    ]),
  },

  // --- More Standards ------------------------------------------------------
  {
    id: 'all-of-me',
    name: 'All of Me — A (C)',
    category: 'Standards',
    bpm: 140,
    timeSignature: FOUR_FOUR,
    sections: one('A', [c('Cmaj7', 2), c('E7', 2), c('A7', 2), c('Dm7', 2)]),
  },
  {
    id: 'summertime',
    name: 'Summertime — A (Am)',
    category: 'Standards',
    bpm: 100,
    timeSignature: FOUR_FOUR,
    sections: one('A', [
      c('Am7'),
      c('Em7'),
      c('Am7'),
      c('Em7'),
      c('Am7'),
      c('Dm7'),
      c('E7', 2),
    ]),
  },
  {
    id: 'misty-a',
    name: 'Misty — A (E♭)',
    category: 'Standards',
    bpm: 100,
    timeSignature: FOUR_FOUR,
    sections: one('A', [
      c('Ebmaj7'),
      c('Bbm7'),
      c('Eb7'),
      c('Abmaj7'),
      c('Abm7'),
      c('Db7'),
      c('Ebmaj7'),
      c('C7'),
    ]),
  },

  // --- More keys -----------------------------------------------------------
  {
    id: 'major-ii-v-i-f',
    name: 'Major ii–V–I (F)',
    category: 'ii–V–I & Turnarounds',
    bpm: 120,
    timeSignature: FOUR_FOUR,
    sections: one('ii–V–I', [c('Gm7', 2), c('C7', 2), c('Fmaj7', 4)]),
  },
  {
    id: 'minor-ii-v-i-am',
    name: 'Minor ii–V–i (Am)',
    category: 'ii–V–I & Turnarounds',
    bpm: 120,
    timeSignature: FOUR_FOUR,
    sections: one('ii–V–i', [c('Bm7b5', 2), c('E7', 2), c('Am7', 4)]),
  },
  {
    id: 'blues-g',
    name: 'Blues in G',
    category: 'Blues',
    bpm: 110,
    timeSignature: FOUR_FOUR,
    sections: one('12-bar', [
      c('G7', 4),
      c('C7', 2),
      c('G7', 2),
      c('D7', 1),
      c('C7', 1),
      c('G7', 2),
    ]),
  },

  // --- Full forms (AABA) ---------------------------------------------------
  {
    id: 'rhythm-changes-full',
    name: 'Rhythm Changes — Full (B♭)',
    category: 'Rhythm Changes',
    bpm: 160,
    timeSignature: FOUR_FOUR,
    sections: [
      {
        name: 'A',
        repeats: 2,
        chords: [
          c('Bb6'),
          c('G7'),
          c('Cm7'),
          c('F7'),
          c('Dm7'),
          c('G7'),
          c('Cm7'),
          c('F7'),
        ],
      },
      {
        name: 'B',
        repeats: 1,
        chords: [c('D7', 2), c('G7', 2), c('C7', 2), c('F7', 2)],
      },
      {
        name: 'A',
        repeats: 1,
        chords: [
          c('Bb6'),
          c('G7'),
          c('Cm7'),
          c('F7'),
          c('Dm7'),
          c('G7'),
          c('Cm7'),
          c('F7'),
        ],
      },
    ],
  },
  {
    id: 'a-train-full',
    name: 'Take the A Train — Full (C)',
    category: 'Standards',
    bpm: 160,
    timeSignature: FOUR_FOUR,
    sections: [
      {
        name: 'A',
        repeats: 2,
        chords: [c('Cmaj7', 2), c('D7', 2), c('Dm7'), c('G7'), c('Cmaj7', 2)],
      },
      {
        name: 'B',
        repeats: 1,
        chords: [c('Fmaj7', 4), c('D7', 2), c('Dm7'), c('G7')],
      },
      {
        name: 'A',
        repeats: 1,
        chords: [c('Cmaj7', 2), c('D7', 2), c('Dm7'), c('G7'), c('Cmaj7', 2)],
      },
    ],
  },
]
