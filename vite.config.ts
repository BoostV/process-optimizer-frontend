/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const path = require('path')

const child_process = require('child_process')

const commitHash = child_process
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim()

const gitVersion = child_process
  .execSync('git describe --tags --always --first-parent --dirty')
  .toString()
  .trim()

const gitBranch = child_process
  .execSync('git branch --show-current')
  .toString()
  .trim()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    COMMITHASH: JSON.stringify(commitHash),
    VERSION: JSON.stringify(gitVersion),
    BRANCH: JSON.stringify(process.env.BRANCH) || JSON.stringify(gitBranch),
  },
  base: '/',
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
