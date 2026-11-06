import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/renderer/src/test/setup.ts']
  },
  resolve: {
    alias: {
      '@renderer': resolve(import.meta.dirname, 'src/renderer/src')
    }
  }
})
