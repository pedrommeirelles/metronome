#!/bin/bash
# Starts the Metronome app and opens it in your browser.
cd "$(dirname "$0")"

# Install dependencies on first run
if [ ! -d node_modules ]; then
  echo "First run: installing dependencies..."
  npm install
fi

# Open the browser after the server has a moment to start
( sleep 2 && open http://localhost:5173 ) &

echo "Starting Metronome... (press Ctrl+C to stop)"
npm run dev
