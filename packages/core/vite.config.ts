/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts(),
    react({
      jsxRuntime: 'classic',
    }),
  ],
  resolve: {
    alias: [{ find: '@core', replacement: resolve(__dirname, './src') }],
  },
  build: {
    minify: false,
    lib: {
      formats: ['es'],
      entry: resolve(__dirname, 'src/index.ts'),
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-hook-form',
        'immer',
        'compare-versions',
        '@boostv/process-optimizer-frontend-api',
      ],
    },
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
