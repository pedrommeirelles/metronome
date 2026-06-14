import { BeatRow } from './ui/BeatRow'
import { MetronomePanel } from './ui/MetronomePanel'
import { TrainerPanel } from './ui/TrainerPanel'
import { TransportControls } from './ui/TransportControls'

export default function App() {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex max-w-3xl flex-col items-center gap-10 px-4 py-10">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Metronome</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Tap a beat to change its accent.
          </p>
        </header>

        <BeatRow />
        <TransportControls />
        <MetronomePanel />
        <TrainerPanel />
      </main>
    </div>
  )
}
