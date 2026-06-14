import { describe, expect, it } from 'vitest'
import {
  advancePosition,
  isBeat,
  isDownbeat,
  secondsPerBeat,
  secondsPerSubdivision,
  START_POSITION,
  type BeatPosition,
} from './transport'

describe('secondsPerBeat / secondsPerSubdivision', () => {
  it('converts BPM to seconds per beat', () => {
    expect(secondsPerBeat(120)).toBeCloseTo(0.5)
    expect(secondsPerBeat(60)).toBeCloseTo(1)
  })

  it('divides the beat by the subdivision', () => {
    expect(secondsPerSubdivision(120, 1)).toBeCloseTo(0.5)
    expect(secondsPerSubdivision(120, 2)).toBeCloseTo(0.25)
    expect(secondsPerSubdivision(120, 4)).toBeCloseTo(0.125)
  })
})

describe('advancePosition', () => {
  it('advances subdivision ticks within a beat', () => {
    const p = advancePosition(START_POSITION, 4, 4)
    expect(p).toEqual({ barCount: 0, beatInBar: 0, subInBeat: 1 })
  })

  it('rolls over to the next beat after the last subdivision', () => {
    let p: BeatPosition = { barCount: 0, beatInBar: 0, subInBeat: 3 }
    p = advancePosition(p, 4, 4)
    expect(p).toEqual({ barCount: 0, beatInBar: 1, subInBeat: 0 })
  })

  it('rolls over to the next bar after the last beat', () => {
    let p: BeatPosition = { barCount: 0, beatInBar: 3, subInBeat: 3 }
    p = advancePosition(p, 4, 4)
    expect(p).toEqual({ barCount: 1, beatInBar: 0, subInBeat: 0 })
  })

  it('returns exactly to the downbeat after a full bar (no drift)', () => {
    const beatsPerBar = 7 // odd meter
    const subdivision = 3 // triplets
    const ticksPerBar = beatsPerBar * subdivision
    let p = START_POSITION
    for (let i = 0; i < ticksPerBar; i++) {
      p = advancePosition(p, beatsPerBar, subdivision)
    }
    expect(p).toEqual({ barCount: 1, beatInBar: 0, subInBeat: 0 })
  })

  it('does not mutate its input', () => {
    const input: BeatPosition = { barCount: 2, beatInBar: 1, subInBeat: 0 }
    advancePosition(input, 4, 2)
    expect(input).toEqual({ barCount: 2, beatInBar: 1, subInBeat: 0 })
  })
})

describe('isBeat / isDownbeat', () => {
  it('detects beats and downbeats', () => {
    expect(isBeat({ barCount: 0, beatInBar: 2, subInBeat: 0 })).toBe(true)
    expect(isBeat({ barCount: 0, beatInBar: 2, subInBeat: 1 })).toBe(false)
    expect(isDownbeat({ barCount: 5, beatInBar: 0, subInBeat: 0 })).toBe(true)
    expect(isDownbeat({ barCount: 5, beatInBar: 1, subInBeat: 0 })).toBe(false)
  })
})
