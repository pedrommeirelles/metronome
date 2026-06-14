import { beforeEach, describe, expect, it } from 'vitest'
import type { Song } from '../state/types'
import { loadSong, saveSong } from './songStorage'

const sample: Song = {
  id: 'song-1',
  name: 'Test Tune',
  bpm: 132,
  timeSignature: { beatsPerBar: 4, beatUnit: 4 },
  metronome: {
    accents: ['strong', 'normal', 'soft', 'normal'],
    subdivision: 2,
    soundId: 'woodblock',
    subdivisionVolume: 0.5,
    volume: 0.8,
  },
  gapTrainer: {
    enabled: false,
    playBars: 4,
    muteBars: 4,
    mode: 'fixed',
    randomMutePct: 0.5,
  },
  tempoAutomation: { enabled: false, increment: 5, everyBars: 4, maxBpm: 200 },
  drone: { enabled: true, register: 'low', waveform: 'sawtooth', volume: 0.3 },
  sections: [
    {
      id: 's1',
      name: 'A',
      repeats: 2,
      chords: [{ id: 'c1', symbol: 'Cmaj7', bars: 4 }],
    },
  ],
}

describe('songStorage', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips a song', () => {
    saveSong(sample)
    expect(loadSong()).toEqual(sample)
  })

  it('returns null when nothing is saved', () => {
    expect(loadSong()).toBeNull()
  })

  it('coerces a partial blob to a full song with defaults', () => {
    saveSong({} as unknown as Song)
    const loaded = loadSong()!
    expect(loaded.bpm).toBe(120)
    expect(loaded.timeSignature).toEqual({ beatsPerBar: 4, beatUnit: 4 })
    expect(loaded.metronome.accents).toHaveLength(4)
    expect(loaded.sections).toEqual([])
  })
})
