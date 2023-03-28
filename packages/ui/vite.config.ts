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
    alias: [{ find: '@ui', replacement: resolve(__dirname, './src') }],
  },
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-hook-form',
        '@boostv/process-optimizer-frontend-api',
        '@boostv/process-optimizer-frontend-core',
        '@boostv/process-optimizer-frontend-plots',
        'immer',
        /@mui.*/,
        '@emotion/react',
        '@emotion/styled',
        'tss-react',
        'tss-react/mui',
      ],
    },
    outDir: 'dist',
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
