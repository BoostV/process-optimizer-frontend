/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import replace from '@rollup/plugin-replace'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    dts(),
    replace({
      preventAssignment: true,
      'mui/material/styles': 'mui/material',
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
        'remeda',
      ],
    },
    outDir: 'dist',
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text-summary'],
    },
    environment: 'jsdom',
    setupFiles: './src/testing/setupTests.ts',
  },
})
