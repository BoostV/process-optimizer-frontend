/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts(),
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        '@bokeh/bokehjs',
        'jquery',
        'recharts',
        // Styling deps are provided by the consumer (e.g. the ui package),
        // not bundled. tss-react/mui pulls in @mui/material/styles, which
        // vite 8's rolldown bundler refuses to bundle as an optional peer.
        /^tss-react/,
        /^@mui\//,
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
