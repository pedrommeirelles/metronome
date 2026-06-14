# Metronome

A browser-first **rhythm & pocket-training metronome** with a continuous **chord drone** for harmonic practice. Inspired by the Soundbrenner web metronome, with an added harmonic layer: define a chord progression, set bars per chord, group chords into sections, and hear a continuous drone of the current chord while the metronome runs — for practicing time/groove, improvisation, bass lines, and harmonic awareness over chord changes.

## Status

Early development. Phase 0 (project scaffold) is complete. See the implementation plan for the full roadmap.

## Tech stack

- **React + TypeScript + Vite**
- **Web Audio API** — clicks and drone (oscillator-synthesized; no audio assets)
- **Tonal.js** — chord parsing (full jazz extensions, slash chords)
- **Zustand** — app/transport state
- **Tailwind CSS v4** — styling
- **Vitest + Testing Library** — tests

## Project structure

```
src/
  audio/        AudioEngine, scheduler Web Worker, click sound bank, chordEngine (framework-agnostic)
  state/        domain types + Zustand store
  ui/           React components
  persistence/  localStorage save/load
  test/         test setup
```

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # type-check and build for production
npm run test       # run tests in watch mode
npm run test:run   # run tests once
npm run lint       # lint
```

## Roadmap (high level)

1. **Core metronome** (the heart): BPM, tap tempo, time signatures (incl. odd/compound), subdivisions, custom per-beat accent patterns, sound bank, visual metronome.
2. **Pocket trainers**: gap/mute trainer, tempo automation.
3. **Chord drone**: oscillator voices, low/mid/high register, click-free chord transitions.
4. **Progression & sections**: chord spans with bar counts, repeats; drone follows the bars.
5. **Persistence & polish**: save/load song, cross-browser pass.

Deferred to a later version: polyrhythm/stacked meters, setlists, expanded/sampled sounds, MIDI/Ableton Link, PWA/mobile.
