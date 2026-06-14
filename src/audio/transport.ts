// Pure transport math: musical position arithmetic and tempo conversions.
//
// Kept free of Web Audio so it can be unit-tested deterministically. The
// AudioEngine schedules every event on the AudioContext clock, so real playback
// never drifts; these helpers only compute *where* and *when* each event lands.

/** A point in the metronome grid. `barCount` is absolute (0-based, monotonic). */
export interface BeatPosition {
  barCount: number
  beatInBar: number
  subInBeat: number
}

export const START_POSITION: BeatPosition = {
  barCount: 0,
  beatInBar: 0,
  subInBeat: 0,
}

/** True when a position lands on a beat (not a subdivision tick). */
export function isBeat(pos: BeatPosition): boolean {
  return pos.subInBeat === 0
}

/** True when a position is the downbeat of a bar. */
export function isDownbeat(pos: BeatPosition): boolean {
  return pos.beatInBar === 0 && pos.subInBeat === 0
}

/** Seconds between consecutive beats at a given tempo. */
export function secondsPerBeat(bpm: number): number {
  return 60 / bpm
}

/** Seconds between consecutive subdivision ticks (even spacing). */
export function secondsPerSubdivision(bpm: number, subdivision: number): number {
  return secondsPerBeat(bpm) / subdivision
}

/**
 * Seconds from the tick at `subInBeat` to the next one, applying swing to
 * eighth-note subdivisions. Swing (0..1) delays the off-beat: 0 = straight
 * (50/50), 1 = full triplet feel (≈67/33). Only affects subdivision === 2;
 * other subdivisions stay evenly spaced.
 */
export function subdivisionInterval(
  bpm: number,
  subdivision: number,
  subInBeat: number,
  swing: number,
): number {
  const beat = secondsPerBeat(bpm)
  if (subdivision === 2 && swing > 0) {
    const ratio = 0.5 + swing * (2 / 3 - 0.5) // 0.5 → straight, 1 → 2/3
    return subInBeat === 0 ? beat * ratio : beat * (1 - ratio)
  }
  return beat / subdivision
}

/**
 * Advance one subdivision tick, rolling over beats and bars.
 * Returns a new position; does not mutate the input.
 */
export function advancePosition(
  pos: BeatPosition,
  beatsPerBar: number,
  subdivision: number,
): BeatPosition {
  let { barCount, beatInBar, subInBeat } = pos
  subInBeat += 1
  if (subInBeat >= subdivision) {
    subInBeat = 0
    beatInBar += 1
    if (beatInBar >= beatsPerBar) {
      beatInBar = 0
      barCount += 1
    }
  }
  return { barCount, beatInBar, subInBeat }
}
