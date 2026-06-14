// Pure pocket-trainer logic, keyed off the absolute bar index. Kept free of Web
// Audio and randomness (for the deterministic parts) so it can be unit-tested.

import type { GapTrainer, TempoAutomation } from '../state/types'

/**
 * Gap trainer, fixed mode: bars cycle through `playBars` audible then `muteBars`
 * muted. Returns true when the click should be muted for `barIndex`.
 * Random mode is handled in the engine (it needs an RNG per bar).
 */
export function isBarMutedFixed(
  barIndex: number,
  playBars: number,
  muteBars: number,
): boolean {
  const cycle = playBars + muteBars
  if (cycle <= 0 || muteBars <= 0) return false
  return barIndex % cycle >= playBars
}

/**
 * Effective tempo for a given bar under tempo automation. Deterministic in
 * `barIndex`, so restarting (bar 0) naturally resets to the base tempo and there
 * is no accumulated rounding error.
 */
export function tempoForBar(
  baseBpm: number,
  barIndex: number,
  automation: TempoAutomation,
): number {
  if (!automation.enabled || automation.everyBars <= 0) return baseBpm
  const steps = Math.floor(barIndex / automation.everyBars)
  const raised = baseBpm + steps * automation.increment
  return Math.min(automation.maxBpm, Math.round(raised))
}

/** Whether the gap trainer would mute this bar (fixed mode only; see note above). */
export function gapTrainerMutesBar(
  barIndex: number,
  gap: GapTrainer,
): boolean {
  if (!gap.enabled || gap.mode !== 'fixed') return false
  return isBarMutedFixed(barIndex, gap.playBars, gap.muteBars)
}
