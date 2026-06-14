// Pocket trainers: gap/mute trainer and tempo automation.

import { useStore } from '../state/store'
import { MAX_BPM, MIN_BPM } from '../state/types'

const numberClass =
  'w-16 rounded-lg bg-zinc-800 px-2 py-1 text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500'

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-emerald-500"
      />
      {label}
    </label>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-400">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={numberClass}
      />
    </label>
  )
}

function GapTrainerCard() {
  const gap = useStore((s) => s.gapTrainer)
  const update = useStore((s) => s.updateGapTrainer)

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-zinc-900 p-5">
      <div className="flex items-center justify-between">
        <Toggle
          checked={gap.enabled}
          onChange={(enabled) => update({ enabled })}
          label="Gap / mute trainer"
        />
      </div>
      <p className="text-xs text-zinc-500">
        Mutes the click for whole bars so you keep time internally — the bar
        count keeps running.
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1">
          {(['fixed', 'random'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => update({ mode })}
              className={`rounded-lg px-3 py-1 text-sm capitalize ${
                gap.mode === mode
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {gap.mode === 'fixed' ? (
          <>
            <NumberField
              label="Play bars"
              value={gap.playBars}
              min={1}
              max={32}
              onChange={(playBars) => update({ playBars: Math.max(1, playBars) })}
            />
            <NumberField
              label="Mute bars"
              value={gap.muteBars}
              min={1}
              max={32}
              onChange={(muteBars) => update({ muteBars: Math.max(1, muteBars) })}
            />
          </>
        ) : (
          <NumberField
            label="Mute chance %"
            value={Math.round((gap.randomMutePct ?? 0) * 100)}
            min={0}
            max={100}
            onChange={(pct) =>
              update({ randomMutePct: Math.min(1, Math.max(0, pct / 100)) })
            }
          />
        )}
      </div>
    </div>
  )
}

function TempoAutomationCard() {
  const tempo = useStore((s) => s.tempoAutomation)
  const update = useStore((s) => s.updateTempoAutomation)

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-zinc-900 p-5">
      <Toggle
        checked={tempo.enabled}
        onChange={(enabled) => update({ enabled })}
        label="Tempo automation"
      />
      <p className="text-xs text-zinc-500">
        Gradually speeds up: adds to the tempo every few bars, up to a ceiling.
        Resets when you stop.
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <NumberField
          label="+BPM"
          value={tempo.increment}
          min={1}
          max={50}
          onChange={(increment) => update({ increment: Math.max(1, increment) })}
        />
        <NumberField
          label="every bars"
          value={tempo.everyBars}
          min={1}
          max={64}
          onChange={(everyBars) => update({ everyBars: Math.max(1, everyBars) })}
        />
        <NumberField
          label="max BPM"
          value={tempo.maxBpm}
          min={MIN_BPM}
          max={MAX_BPM}
          onChange={(maxBpm) =>
            update({
              maxBpm: Math.min(MAX_BPM, Math.max(MIN_BPM, maxBpm)),
            })
          }
        />
      </div>
    </div>
  )
}

export function TrainerPanel() {
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <GapTrainerCard />
      <TempoAutomationCard />
    </div>
  )
}
