// AudioEngine — framework-agnostic metronome core.
//
// Owns the AudioContext and the Web Audio graph. Uses the "lookahead" pattern
// (Chris Wilson, "A Tale of Two Clocks"): a Web Worker posts a tick every ~25ms;
// on each tick we schedule every event falling within the next ~100ms directly
// on the AudioContext clock via precise start times. Playback is therefore
// sample-accurate and drift-free regardless of JS timer jitter.
//
// React never imports Web Audio directly — it talks to this engine and
// subscribes to position updates via onPosition().

import {
  defaultMetronomeConfig,
  type MetronomeConfig,
  type TimeSignature,
} from '../state/types'
import {
  frequencyForAccent,
  gainForAccent,
  getSound,
  scheduleClick,
} from './soundBank'
import {
  advancePosition,
  isBeat,
  secondsPerSubdivision,
  START_POSITION,
  type BeatPosition,
} from './transport'

const SCHEDULE_AHEAD_TIME = 0.1 // seconds to schedule into the future
const WORKER_INTERVAL = 25 // ms between scheduler wake-ups
const FIRST_NOTE_DELAY = 0.1 // seconds before the first click

export type PositionListener = (pos: BeatPosition, isPlaying: boolean) => void

interface ScheduledNote {
  position: BeatPosition
  time: number
}

type AudioContextCtor = typeof AudioContext

export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private worker: Worker | null = null

  private playing = false
  private bpm = 120
  private timeSignature: TimeSignature = { beatsPerBar: 4, beatUnit: 4 }
  private config: MetronomeConfig = defaultMetronomeConfig(4)

  private cursor: BeatPosition = START_POSITION
  private displayPos: BeatPosition = START_POSITION
  private nextNoteTime = 0
  private queue: ScheduledNote[] = []
  private rafId: number | null = null
  private readonly listeners = new Set<PositionListener>()

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

  setBpm(bpm: number): void {
    this.bpm = bpm
  }

  setTimeSignature(ts: TimeSignature): void {
    this.timeSignature = ts
  }

  setConfig(config: MetronomeConfig): void {
    this.config = config
  }

  async start(): Promise<void> {
    if (this.playing) return

    if (!this.ctx) {
      const Ctor: AudioContextCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: AudioContextCtor })
          .webkitAudioContext
      this.ctx = new Ctor()
      this.master = this.ctx.createGain()
      this.master.gain.value = 1
      this.master.connect(this.ctx.destination)
    }
    await this.ctx.resume()

    if (!this.worker) {
      this.worker = new Worker(
        new URL('./scheduler.worker.ts', import.meta.url),
        { type: 'module' },
      )
      this.worker.onmessage = () => this.schedule()
    }

    this.cursor = START_POSITION
    this.displayPos = START_POSITION
    this.queue = []
    this.nextNoteTime = this.ctx.currentTime + FIRST_NOTE_DELAY
    this.playing = true
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
    this.notify()
  }

  // --- internals -------------------------------------------------------------

  /** Schedule all events that fall within the lookahead window. */
  private schedule(): void {
    if (!this.ctx || !this.playing) return
    const horizon = this.ctx.currentTime + SCHEDULE_AHEAD_TIME
    while (this.nextNoteTime < horizon) {
      this.scheduleNote(this.cursor, this.nextNoteTime)
      this.queue.push({ position: this.cursor, time: this.nextNoteTime })
      this.nextNoteTime += secondsPerSubdivision(this.bpm, this.config.subdivision)
      this.cursor = advancePosition(
        this.cursor,
        this.timeSignature.beatsPerBar,
        this.config.subdivision,
      )
    }
  }

  private scheduleNote(pos: BeatPosition, time: number): void {
    if (!this.ctx || !this.master) return
    const { config } = this
    const sound = getSound(config.soundId)
    const level =
      config.accents[pos.beatInBar] ?? (pos.beatInBar === 0 ? 'strong' : 'normal')

    // A muted beat silences its subdivision ticks too.
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
        this.displayPos = this.queue.shift()!.position
        updated = true
      }
      if (updated) this.notify()
      this.rafId = requestAnimationFrame(tick)
    }
    this.rafId = requestAnimationFrame(tick)
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.displayPos, this.playing)
  }
}

/** Shared singleton — created once, AudioContext is allocated lazily on start(). */
export const audioEngine = new AudioEngine()
