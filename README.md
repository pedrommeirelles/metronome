# Metronome

A browser-first **rhythm & pocket-training metronome** with a continuous **chord drone** for harmonic practice. Inspired by the Soundbrenner web metronome, with an added harmonic layer: define a chord progression, set bars per chord, group chords into sections, and hear a continuous drone of the current chord while the metronome runs — for practicing time/groove, improvisation, bass lines, and harmonic awareness over chord changes.

## Status

MVP complete and extended. Implemented:

- **Metronome:** accurate drift-free timing, subdivisions, custom per-beat
  accents, odd/compound meters, sound bank, tap tempo, **count-in**, **swing**.
- **Pocket trainers:** gap/mute trainer, tempo automation.
- **Chord drone:** oscillator voices, low/mid/high register, click-free chord
  changes (full jazz chords via Tonal.js).
- **Progression:** sections with repeats and bar-per-chord spans, driving the
  drone in sync; now-playing display.
- **Library:** ~30 built-in progressions and standards (blues, ii–V–I, rhythm
  changes incl. full AABA, modal, bossa, standards) loadable in one click.
- **Persistence:** the working song silently auto-saves to localStorage and
  restores on refresh.
- **PWA:** installable + offline (web manifest + service worker, registered in
  production builds).

Deferred (vNext): polyrhythm / stacked meters, setlists (multiple saved songs),
expanded/sampled sounds, MIDI / Ableton Link, crisp PNG PWA icons.

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
  audio/        AudioEngine, scheduler Web Worker, click sound bank, chordEngine, drone (framework-agnostic)
  state/        domain types, Zustand store, progression timeline
  data/         built-in progression/standards library (presets)
  ui/           React components
  persistence/  localStorage auto-save / restore
  test/         test setup
public/         PWA manifest, service worker, icon
```

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # type-check and build for production
npm run test       # run tests in watch mode
npm run test:run   # run tests once
npm run lint       # lint
```

## Resuming development

```bash
git clone https://github.com/pedrommeirelles/metronome.git
cd metronome
npm install
npm run dev          # http://localhost:5173
```

Verify a clean checkout with `npm run test:run` (should be all green) and
`npm run build`. To exercise the PWA (install + offline), use a production
build: `npm run build && npm run preview`.

**Architecture in one line:** a framework-agnostic `AudioEngine` (one lookahead
scheduler on a single AudioContext clock) drives clicks, trainers, and the
drone; React only subscribes via the Zustand store and never touches Web Audio.

**Possible next steps (vNext):** polyrhythm / stacked meters, setlists (multiple
saved songs), expanded/sampled sounds, MIDI / Ableton Link, crisp PNG PWA icons
for the best install prompt.
