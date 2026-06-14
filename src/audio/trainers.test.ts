import { describe, expect, it } from 'vitest'
import type { TempoAutomation } from '../state/types'
import { isBarMutedFixed, tempoForBar } from './trainers'

describe('isBarMutedFixed', () => {
  it('plays the first block of bars, then mutes the next block', () => {
    // playBars=2, muteBars=2 → cycle of 4: bars 0,1 play; 2,3 mute; repeat
    const muted = [0, 1, 2, 3, 4, 5, 6, 7].map((b) => isBarMutedFixed(b, 2, 2))
    expect(muted).toEqual([false, false, true, true, false, false, true, true])
  })

  it('never mutes when muteBars is 0', () => {
    expect(isBarMutedFixed(5, 4, 0)).toBe(false)
  })
})

describe('tempoForBar', () => {
  const base: TempoAutomation = {
    enabled: true,
    increment: 10,
    everyBars: 2,
    maxBpm: 200,
  }

  it('returns the base tempo when disabled', () => {
    expect(tempoForBar(120, 10, { ...base, enabled: false })).toBe(120)
  })

  it('steps up every N bars', () => {
    expect(tempoForBar(120, 0, base)).toBe(120)
    expect(tempoForBar(120, 1, base)).toBe(120)
    expect(tempoForBar(120, 2, base)).toBe(130)
    expect(tempoForBar(120, 4, base)).toBe(140)
  })

  it('clamps at maxBpm', () => {
    expect(tempoForBar(120, 100, base)).toBe(200)
  })
})
