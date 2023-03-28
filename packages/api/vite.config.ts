/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'path'
import noBundlePlugin from 'vite-plugin-no-bundle'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [noBundlePlugin(), dts()],
  build: {
    lib: {
      formats: ['es'],
      entry: resolve(__dirname, 'openapi/index.ts'),
    },
  },
})
