import { beforeEach, describe, expect, it } from 'vitest'
import { loadSong } from '../persistence/songStorage'
import { useStore } from './store'

describe('store persistence integration', () => {
  beforeEach(() => localStorage.clear())

  it('saves the current state and can load it back', () => {
    const s = useStore.getState()
    s.setName('My Song')
    s.setBpm(99)
    s.addSection()
    s.save()

    const saved = loadSong()
    expect(saved?.name).toBe('My Song')
    expect(saved?.bpm).toBe(99)
    expect(saved?.sections.length).toBe(useStore.getState().sections.length)
  })

  it('loadSaved applies a previously saved song to state', () => {
    useStore.getState().setName('Saved Tune')
    useStore.getState().setBpm(140)
    useStore.getState().save()

    useStore.getState().setName('Edited (unsaved)')
    useStore.getState().setBpm(80)

    useStore.getState().loadSaved()
    expect(useStore.getState().name).toBe('Saved Tune')
    expect(useStore.getState().bpm).toBe(140)
  })
})
