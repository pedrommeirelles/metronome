import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Node's experimental global localStorage needs a flag and jsdom doesn't supply
// one here, so provide a simple in-memory implementation for tests.
function createLocalStorageMock(): Storage {
  let store: Record<string, string> = {}
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value)
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    key: (index) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length
    },
  } as Storage
}

vi.stubGlobal('localStorage', createLocalStorageMock())
