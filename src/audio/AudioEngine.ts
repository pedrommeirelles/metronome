// AudioEngine — framework-agnostic metronome core.
//
// Owns the AudioContext and the Web Audio graph. Uses the "lookahead" pattern
// (Chris Wilson, "A Tale of Two Clocks"): a Web Worker posts a tick every ~25ms;
// on each tick we schedule every event falling within the next ~100ms directly
// on the AudioContext clock via precise start times. Playback is therefore
// sample-accurate and drift-free regardless of JS timer jitter.
//
// Pocket trainers are applied at bar boundaries: tempo automation recomputes the
// effective tempo per bar, and the gap trainer decides whether a bar's clicks
// are muted. React never imports Web Audio directly — it talks to this engine.

import {
  defaultDroneConfig,
  defaultGapTrainer,
  defaultMetronomeConfig,
  defaultTempoAutomation,
  type DroneConfig,
  type GapTrainer,
  type MetronomeConfig,
  type TempoAutomation,
  type TimeSignature,
} from '../state/types'
import { voiceChordSymbol } from './chordEngine'
import { DroneVoices } from './DroneVoices'
import {
  frequencyForAccent,
  gainForAccent,
  getSound,
  scheduleClick,
} from './soundBank'
import {
  advancePosition,
  isBeat,
  isDownbeat,
  secondsPerSubdivision,
  START_POSITION,
  type BeatPosition,
} from './transport'
import { isBarMutedFixed, tempoForBar } from './trainers'

const SCHEDULE_AHEAD_TIME = 0.1 // seconds to schedule into the future
const WORKER_INTERVAL = 25 // ms between scheduler wake-ups
const FIRST_NOTE_DELAY = 0.1 // seconds before the first click

export type PositionListener = (
  pos: BeatPosition,
  isPlaying: boolean,
  muted: boolean,
) => void
export type BpmListener = (bpm: number) => void

interface ScheduledNote {
  position: BeatPosition
  time: number
  muted: boolean
}

type AudioContextCtor = typeof AudioContext

export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private worker: Worker | null = null

  private playing = false
  /** User-set tempo (the slider). */
  private baseBpm = 120
  /** Effective tempo after tempo automation. */
  private bpm = 120
  private timeSignature: TimeSignature = { beatsPerBar: 4, beatUnit: 4 }
  private config: MetronomeConfig = defaultMetronomeConfig(4)
  private gapTrainer: GapTrainer = defaultGapTrainer()
  private tempoAutomation: TempoAutomation = defaultTempoAutomation()
  private droneConfig: DroneConfig = defaultDroneConfig()
  private droneVoices: DroneVoices | null = null
  private currentChord: string | null = null

  private cursor: BeatPosition = START_POSITION
  private displayPos: BeatPosition = START_POSITION
  private currentBarMuted = false
  private displayMuted = false
  private nextNoteTime = 0
  private queue: ScheduledNote[] = []
  private rafId: number | null = null
  private readonly listeners = new Set<PositionListener>()
  private readonly bpmListeners = new Set<BpmListener>()

  get isPlaying(): boolean {
    return this.playing
  }

  get currentBpm(): number {
    return this.bpm
  }

  /** Subscribe to position updates (synced to audio time). Returns an unsubscribe. */
  onPosition(listener: PositionListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** Subscribe to effective-tempo changes (e.g. from tempo automation). */
  onBpm(listener: BpmListener): () => void {
    this.bpmListeners.add(listener)
    return () => {
      this.bpmListeners.delete(listener)
    }
  }

  setBpm(bpm: number): void {
    this.baseBpm = bpm
    this.bpm = this.playing
      ? tempoForBar(bpm, this.cursor.barCount, this.tempoAutomation)
      : bpm
    this.fireBpm()
  }

  setTimeSignature(ts: TimeSignature): void {
    this.timeSignature = ts
  }

  setConfig(config: MetronomeConfig): void {
    this.config = config
  }

  setGapTrainer(gap: GapTrainer): void {
    this.gapTrainer = gap
  }

  setTempoAutomation(automation: TempoAutomation): void {
    this.tempoAutomation = automation
  }

  setDroneConfig(config: DroneConfig): void {
    const prev = this.droneConfig
    this.droneConfig = config
    // Enabling the drone is a user gesture, so it's safe to spin up the context.
    if (config.enabled) {
      this.ensureContext()
      void this.ctx?.resume()
    }
    if (this.droneVoices) {
      this.droneVoices.setWaveform(config.waveform)
      this.droneVoices.setVolume(config.volume)
      this.droneVoices.setEnabled(config.enabled)
    }
    if (config.register !== prev.register) this.applyChord()
  }

  /** Set the chord the drone should sound (a symbol like "Cmaj7", or null). */
  setChord(symbol: string | null): void {
    this.currentChord = symbol
    this.applyChord()
  }

  private applyChord(): void {
    if (!this.droneVoices) return
    if (!this.currentChord) {
      this.droneVoices.setFrequencies([])
      return
    }
    const voiced = voiceChordSymbol(this.currentChord, this.droneConfig.register)
    this.droneVoices.setFrequencies(voiced.valid ? voiced.frequencies : [])
  }

  /**
   * Lazily create the AudioContext and Web Audio graph. Must be called from a
   * user gesture (Play, or enabling the drone) so the context isn't suspended.
   */
  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const Ctor: AudioContextCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: AudioContextCtor })
          .webkitAudioContext
      this.ctx = new Ctor()
      this.master = this.ctx.createGain()
      this.master.gain.value = 1
      this.master.connect(this.ctx.destination)
      this.droneVoices = new DroneVoices(this.ctx, this.master)
      this.droneVoices.setWaveform(this.droneConfig.waveform)
      this.droneVoices.setVolume(this.droneConfig.volume)
      this.droneVoices.setEnabled(this.droneConfig.enabled)
      this.applyChord()
    }
    return this.ctx
  }

  async start(): Promise<void> {
    if (this.playing) return

    const ctx = this.ensureContext()
    await ctx.resume()

    if (!this.worker) {
      this.worker = new Worker(
        new URL('./scheduler.worker.ts', import.meta.url),
        { type: 'module' },
      )
      this.worker.onmessage = () => this.schedule()
    }

    this.cursor = START_POSITION
    this.displayPos = START_POSITION
    this.currentBarMuted = false
    this.displayMuted = false
    this.bpm = this.baseBpm
    this.queue = []
    this.nextNoteTime = ctx.currentTime + FIRST_NOTE_DELAY
    this.playing = true
    this.fireBpm()
    this.worker.postMessage({ type: 'start', interval: WORKER_INTERVAL })
    this.startDrawLoop()
    this.notify()
  }

  stop(): void {
    if (!this.playing) return
    this.playing = false
    this.worker?.postMessage({ type: 'stop' })
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.queue = []
    this.bpm = this.baseBpm
    this.fireBpm()
    this.notify()
  }

  // --- internals -------------------------------------------------------------

  /** Schedule all events that fall within the lookahead window. */
  private schedule(): void {
    if (!this.ctx || !this.playing) return
    const horizon = this.ctx.currentTime + SCHEDULE_AHEAD_TIME
    while (this.nextNoteTime < horizon) {
      if (isDownbeat(this.cursor)) this.enterBar(this.cursor.barCount)
      this.scheduleNote(this.cursor, this.nextNoteTime, this.currentBarMuted)
      this.queue.push({
        position: this.cursor,
        time: this.nextNoteTime,
        muted: this.currentBarMuted,
      })
      this.nextNoteTime += secondsPerSubdivision(
        this.bpm,
        this.config.subdivision,
      )
      this.cursor = advancePosition(
        this.cursor,
        this.timeSignature.beatsPerBar,
        this.config.subdivision,
      )
    }
  }

  /** Apply per-bar trainer effects when a new bar begins. */
  private enterBar(barIndex: number): void {
    const effective = tempoForBar(this.baseBpm, barIndex, this.tempoAutomation)
    if (effective !== this.bpm) {
      this.bpm = effective
      this.fireBpm()
    }
    this.currentBarMuted = this.decideMute(barIndex)
  }

  private decideMute(barIndex: number): boolean {
    const gap = this.gapTrainer
    if (!gap.enabled) return false
    if (gap.mode === 'fixed') {
      return isBarMutedFixed(barIndex, gap.playBars, gap.muteBars)
    }
    return Math.random() < (gap.randomMutePct ?? 0)
  }

  private scheduleNote(pos: BeatPosition, time: number, muted: boolean): void {
    if (!this.ctx || !this.master || muted) return
    const { config } = this
    const sound = getSound(config.soundId)
    const level =
      config.accents[pos.beatInBar] ?? (pos.beatInBar === 0 ? 'strong' : 'normal')

    // A muted-accent beat silences its subdivision ticks too.
    if (level === 'muted') return

    if (isBeat(pos)) {
      const gain = gainForAccent(level) * config.volume
      scheduleClick(
        this.ctx,
        this.master,
        sound,
        time,
        frequencyForAccent(sound, level),
        gain,
      )
    } else {
      const gain = config.volume * config.subdivisionVolume * 0.6
      scheduleClick(this.ctx, this.master, sound, time, sound.frequency, gain)
    }
  }

  /** Advance the visual position when the audio clock reaches each queued note. */
  private startDrawLoop(): void {
    const tick = () => {
      if (!this.playing || !this.ctx) return
      const now = this.ctx.currentTime
      let updated = false
      while (this.queue.length > 0 && this.queue[0].time <= now) {
        const note = this.queue.shift()!
        this.displayPos = note.position
        this.displayMuted = note.muted
        updated = true
      }
      if (updated) this.notify()
      this.rafId = requestAnimationFrame(tick)
    }
    this.rafId = requestAnimationFrame(tick)
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.displayPos, this.playing, this.displayMuted)
    }
  }

  private fireBpm(): void {
    for (const listener of this.bpmListeners) listener(this.bpm)
  }
}

/** Shared singleton — created once, AudioContext is allocated lazily on start(). */
export const audioEngine = new AudioEngine()
