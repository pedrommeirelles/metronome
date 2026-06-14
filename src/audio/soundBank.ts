// Synthesized click sound bank (zero audio assets).
//
// Each sound is a short oscillator blip shaped by a fast gain envelope. The
// AccentLevel selects pitch + relative gain; subdivision ticks reuse the base
// pitch at a lower gain.

import type { AccentLevel } from '../state/types'

export interface ClickSound {
  id: string
  label: string
  /** Oscillator waveform. */
  type: OscillatorType
  /** Frequency (Hz) for normal/soft beats and subdivision ticks. */
  frequency: number
  /** Frequency (Hz) for the strong (accented) beat. */
  accentFrequency: number
  /** Envelope decay time in seconds. */
  decay: number
}

export const SOUND_BANK: ClickSound[] = [
  {
    id: 'beep',
    label: 'Beep',
    type: 'square',
    frequency: 880,
    accentFrequency: 1320,
    decay: 0.05,
  },
  {
    id: 'click',
    label: 'Click',
    type: 'triangle',
    frequency: 1000,
    accentFrequency: 1500,
    decay: 0.03,
  },
  {
    id: 'woodblock',
    label: 'Woodblock',
    type: 'sine',
    frequency: 1200,
    accentFrequency: 1800,
    decay: 0.045,
  },
]

export const DEFAULT_SOUND = SOUND_BANK[0]

export function getSound(id: string): ClickSound {
  return SOUND_BANK.find((s) => s.id === id) ?? DEFAULT_SOUND
}

/** Relative gain multiplier (0..1) for each accent level. */
export function gainForAccent(level: AccentLevel): number {
  switch (level) {
    case 'strong':
      return 1
    case 'normal':
      return 0.7
    case 'soft':
      return 0.4
    case 'muted':
      return 0
  }
}

/** Frequency to use for a beat at the given accent level. */
export function frequencyForAccent(sound: ClickSound, level: AccentLevel): number {
  return level === 'strong' ? sound.accentFrequency : sound.frequency
}

/**
 * Schedule a single click on the audio graph at `time`, with peak gain `gain`.
 * Uses a tiny attack and an exponential decay to avoid pops. A gain of 0 is a
 * no-op (muted).
 */
export function scheduleClick(
  ctx: BaseAudioContext,
  destination: AudioNode,
  sound: ClickSound,
  time: number,
  frequency: number,
  gain: number,
): void {
  if (gain <= 0) return

  const osc = ctx.createOscillator()
  const env = ctx.createGain()
  osc.type = sound.type
  osc.frequency.setValueAtTime(frequency, time)

  env.gain.setValueAtTime(0.0001, time)
  env.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), time + 0.001)
  env.gain.exponentialRampToValueAtTime(0.0001, time + sound.decay)

  osc.connect(env).connect(destination)
  osc.start(time)
  osc.stop(time + sound.decay + 0.02)
}
