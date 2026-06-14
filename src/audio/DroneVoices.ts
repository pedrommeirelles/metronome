// Continuous chord drone: one oscillator per chord tone, summed through a gentle
// low-pass filter and a master gain. Chord changes crossfade (ramp old voices
// down, new voices up) so transitions are click-free. Shares the AudioEngine's
// AudioContext so the drone and metronome ride the same clock.

import type { Waveform } from '../state/types'

const CROSSFADE = 0.08 // seconds
const GAIN_GLIDE = 0.05 // seconds for volume/enable ramps
const LOWPASS_HZ = 2200

function sameFrequencies(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  return a.every((f, i) => Math.abs(f - b[i]) < 0.01)
}

interface Voice {
  osc: OscillatorNode
  gain: GainNode
}

export class DroneVoices {
  private readonly ctx: BaseAudioContext
  private readonly out: GainNode
  private readonly filter: BiquadFilterNode
  private voices: Voice[] = []

  private waveform: Waveform = 'sawtooth'
  private volume = 0.3
  private enabled = false
  private currentFreqs: number[] = []

  constructor(ctx: BaseAudioContext, destination: AudioNode) {
    this.ctx = ctx
    this.filter = ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.value = LOWPASS_HZ
    this.out = ctx.createGain()
    this.out.gain.value = 0
    this.filter.connect(this.out).connect(destination)
  }

  setWaveform(waveform: Waveform): void {
    this.waveform = waveform
    for (const v of this.voices) v.osc.type = waveform
  }

  setVolume(volume: number): void {
    this.volume = volume
    this.applyMasterGain()
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.applyMasterGain()
  }

  /** Set the sounding chord by frequency; crossfades from the current voices. */
  setFrequencies(frequencies: number[]): void {
    if (sameFrequencies(frequencies, this.currentFreqs)) return
    const t = this.ctx.currentTime

    // Fade out and retire the old voices.
    for (const v of this.voices) {
      v.gain.gain.cancelScheduledValues(t)
      v.gain.gain.setTargetAtTime(0, t, CROSSFADE / 3)
      v.osc.stop(t + CROSSFADE + 0.1)
    }
    this.voices = []

    // Fade in the new voices, each at 1/n to keep the sum below clipping.
    const per = frequencies.length > 0 ? 1 / frequencies.length : 0
    for (const f of frequencies) {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = this.waveform
      osc.frequency.setValueAtTime(f, t)
      gain.gain.setValueAtTime(0, t)
      gain.gain.setTargetAtTime(per, t, CROSSFADE / 3)
      osc.connect(gain).connect(this.filter)
      osc.start(t)
      this.voices.push({ osc, gain })
    }
    this.currentFreqs = [...frequencies]
  }

  private applyMasterGain(): void {
    const target = this.enabled ? this.volume : 0
    const t = this.ctx.currentTime
    this.out.gain.cancelScheduledValues(t)
    this.out.gain.setTargetAtTime(target, t, GAIN_GLIDE)
  }
}
