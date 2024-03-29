/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  build: {
    minify: false,
    lib: {
      formats: ['es', 'umd'],
      name: 'process-optimizer-api',
      entry: resolve(__dirname, 'openapi/index.ts'),
    },
  },
})
