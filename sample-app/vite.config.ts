/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { execSync } from 'child_process'

const commitHash = execSync('git rev-parse --short HEAD').toString().trim()

const gitVersion = execSync(
  'git describe --tags --always --first-parent --dirty'
)
  .toString()
  .trim()

const gitBranch = execSync('git branch --show-current').toString().trim()

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
    alias: [{ find: '@', replacement: resolve(__dirname, './src') }],
  },
  test: {
    coverage: {
      reporter: ['lcov', 'text-summary'],
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testing/setupTests.ts',
  },
})
