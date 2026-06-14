// Progression editor: sections (name + repeats) each holding chord spans
// (symbol + bars). Supports add/remove/reorder. The chord currently playing is
// highlighted, derived from the audio-synced bar position.

import { useMemo } from 'react'
import { voiceChordSymbol } from '../audio/chordEngine'
import { buildTimeline, chordAtBar } from '../state/progression'
import { useStore } from '../state/store'
import type { Section } from '../state/types'

const iconBtn =
  'flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30'
const textInput =
  'rounded-lg bg-zinc-800 px-2 py-1 text-zinc-100 outline-none focus:ring-2 focus:ring-violet-500'

function ChordRow({
  section,
  chordId,
  active,
}: {
  section: Section
  chordId: string
  active: boolean
}) {
  const updateChord = useStore((s) => s.updateChord)
  const removeChord = useStore((s) => s.removeChord)
  const moveChord = useStore((s) => s.moveChord)

  const chord = section.chords.find((c) => c.id === chordId)!
  const invalid =
    chord.symbol.trim() !== '' && !voiceChordSymbol(chord.symbol, 'mid').valid

  return (
    <div
      className={`flex items-center gap-2 rounded-lg p-1 ${
        active ? 'bg-violet-500/20 ring-1 ring-violet-500/50' : ''
      }`}
    >
      <input
        value={chord.symbol}
        onChange={(e) =>
          updateChord(section.id, chordId, { symbol: e.target.value })
        }
        placeholder="chord"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className={`${textInput} w-28 ${invalid ? 'ring-2 ring-red-500' : ''}`}
      />
      <input
        type="number"
        min={1}
        max={64}
        value={chord.bars}
        onChange={(e) =>
          updateChord(section.id, chordId, {
            bars: Math.max(1, Number(e.target.value)),
          })
        }
        className={`${textInput} w-16`}
        title="Bars"
      />
      <span className="text-xs text-zinc-500">bars</span>
      <div className="ml-auto flex gap-1">
        <button
          type="button"
          className={iconBtn}
          onClick={() => moveChord(section.id, chordId, -1)}
          aria-label="Move chord up"
        >
          ↑
        </button>
        <button
          type="button"
          className={iconBtn}
          onClick={() => moveChord(section.id, chordId, 1)}
          aria-label="Move chord down"
        >
          ↓
        </button>
        <button
          type="button"
          className={iconBtn}
          onClick={() => removeChord(section.id, chordId)}
          disabled={section.chords.length <= 1}
          aria-label="Remove chord"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function SectionCard({
  section,
  activeChordId,
}: {
  section: Section
  activeChordId: string | null
}) {
  const updateSection = useStore((s) => s.updateSection)
  const removeSection = useStore((s) => s.removeSection)
  const moveSection = useStore((s) => s.moveSection)
  const addChord = useStore((s) => s.addChord)

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-zinc-900 p-4">
      <div className="flex items-center gap-2">
        <input
          value={section.name}
          onChange={(e) =>
            updateSection(section.id, { name: e.target.value })
          }
          className={`${textInput} w-32 font-semibold`}
          aria-label="Section name"
        />
        <label className="flex items-center gap-1 text-xs text-zinc-500">
          ×
          <input
            type="number"
            min={1}
            max={32}
            value={section.repeats}
            onChange={(e) =>
              updateSection(section.id, {
                repeats: Math.max(1, Number(e.target.value)),
              })
            }
            className={`${textInput} w-14`}
            title="Repeats"
          />
        </label>
        <div className="ml-auto flex gap-1">
          <button
            type="button"
            className={iconBtn}
            onClick={() => moveSection(section.id, -1)}
            aria-label="Move section up"
          >
            ↑
          </button>
          <button
            type="button"
            className={iconBtn}
            onClick={() => moveSection(section.id, 1)}
            aria-label="Move section down"
          >
            ↓
          </button>
          <button
            type="button"
            className={iconBtn}
            onClick={() => removeSection(section.id)}
            aria-label="Remove section"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {section.chords.map((c) => (
          <ChordRow
            key={c.id}
            section={section}
            chordId={c.id}
            active={c.id === activeChordId}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => addChord(section.id)}
        className="self-start rounded-lg bg-zinc-800 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-700"
      >
        + Chord
      </button>
    </div>
  )
}

export function ProgressionEditor() {
  const sections = useStore((s) => s.sections)
  const isPlaying = useStore((s) => s.isPlaying)
  const barCount = useStore((s) => s.position.barCount)
  const addSection = useStore((s) => s.addSection)

  const activeChordId = useMemo(() => {
    if (!isPlaying) return null
    return chordAtBar(buildTimeline(sections), barCount)?.chordSpanId ?? null
  }, [isPlaying, sections, barCount])

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
        Progression
      </h2>
      {sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          activeChordId={activeChordId}
        />
      ))}
      <button
        type="button"
        onClick={addSection}
        className="self-start rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
      >
        + Section
      </button>
    </div>
  )
}
