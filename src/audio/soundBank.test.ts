import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SOUND,
  frequencyForAccent,
  gainForAccent,
  getSound,
} from './soundBank'

describe('gainForAccent', () => {
  it('maps accent levels to descending gains, muted = 0', () => {
    expect(gainForAccent('strong')).toBe(1)
    expect(gainForAccent('normal')).toBeLessThan(gainForAccent('strong'))
    expect(gainForAccent('soft')).toBeLessThan(gainForAccent('normal'))
    expect(gainForAccent('muted')).toBe(0)
  })
})

describe('frequencyForAccent', () => {
  it('uses the accent frequency only for strong beats', () => {
    const s = DEFAULT_SOUND
    expect(frequencyForAccent(s, 'strong')).toBe(s.accentFrequency)
    expect(frequencyForAccent(s, 'normal')).toBe(s.frequency)
    expect(frequencyForAccent(s, 'soft')).toBe(s.frequency)
  })
})

describe('getSound', () => {
  it('returns the requested sound', () => {
    expect(getSound('woodblock').id).toBe('woodblock')
  })

  it('falls back to the default for an unknown id', () => {
    expect(getSound('does-not-exist')).toBe(DEFAULT_SOUND)
  })
})
