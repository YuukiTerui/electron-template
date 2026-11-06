import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock Electron window objects for renderer testing
const mockSystemInfo = {
  platform: 'darwin',
  arch: 'arm64',
  osVersion: '24.0.0',
  totalMemoryGb: '32.0',
  freeMemoryGb: '16.0',
  electronVersion: '34.0.0',
  chromeVersion: '132.0.0',
  nodeVersion: '22.0.0'
}

Object.defineProperty(window, 'electron', {
  value: {
    process: {
      platform: 'darwin',
      versions: {
        electron: '34.0.0',
        chrome: '132.0.0',
        node: '22.0.0'
      }
    },
    ipcRenderer: {
      send: vi.fn(),
      invoke: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn()
    }
  },
  writable: true
})

Object.defineProperty(window, 'api', {
  value: {
    ping: vi.fn().mockResolvedValue('pong'),
    getSystemInfo: vi.fn().mockResolvedValue(mockSystemInfo),
    selectFile: vi.fn().mockResolvedValue('/Users/example/test.txt'),
    showNotification: vi.fn().mockResolvedValue(true)
  },
  writable: true
})
