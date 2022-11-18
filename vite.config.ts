/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@openapi', replacement: path.resolve(__dirname, './openapi') },
    ],
  },
  test: {
    coverage: {
      reporter: ['lcov', 'text-summary'],
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testing/setupTests.ts',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          jquery: ['src/jquery-shim.ts'],
          bokeh: ['@bokeh/bokehjs'],
        },
      },
    },
  },
})
