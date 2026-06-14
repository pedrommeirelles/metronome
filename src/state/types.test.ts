import { describe, expect, it } from 'vitest'
import { defaultAccents, resizeAccents } from './types'

describe('defaultAccents', () => {
  it('makes a strong downbeat and normal rest', () => {
    expect(defaultAccents(4)).toEqual(['strong', 'normal', 'normal', 'normal'])
  })
})

describe('resizeAccents', () => {
  it('preserves existing accents when growing', () => {
    const out = resizeAccents(['strong', 'soft'], 4)
    expect(out).toEqual(['strong', 'soft', 'normal', 'normal'])
  })

  it('truncates when shrinking', () => {
    const out = resizeAccents(['strong', 'soft', 'muted', 'normal'], 2)
    expect(out).toEqual(['strong', 'soft'])
  })

  it('guarantees a strong downbeat if none survives', () => {
    const out = resizeAccents(['normal', 'strong', 'soft'], 1)
    expect(out).toEqual(['strong'])
  })
})
