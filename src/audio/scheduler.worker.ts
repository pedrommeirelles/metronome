// Scheduler timer running in a Web Worker.
//
// setTimeout/setInterval on the main thread are throttled when a tab is
// backgrounded, which would stall the metronome. Running the ticker in a worker
// keeps it firing. The worker does no audio work — it just posts a 'tick' on a
// fixed interval; the AudioEngine reacts by scheduling notes on the audio clock.

type InMessage =
  | { type: 'start'; interval?: number }
  | { type: 'stop' }
  | { type: 'setInterval'; interval: number }

let timer: ReturnType<typeof setInterval> | null = null
let interval = 25 // ms

function post(message: string): void {
  ;(self as unknown as { postMessage: (m: unknown) => void }).postMessage(message)
}

function startTimer(): void {
  if (timer !== null) clearInterval(timer)
  timer = setInterval(() => post('tick'), interval)
}

function stopTimer(): void {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

self.addEventListener('message', (event: MessageEvent<InMessage>) => {
  const data = event.data
  switch (data.type) {
    case 'start':
      if (typeof data.interval === 'number') interval = data.interval
      startTimer()
      break
    case 'stop':
      stopTimer()
      break
    case 'setInterval':
      interval = data.interval
      if (timer !== null) startTimer()
      break
  }
})
