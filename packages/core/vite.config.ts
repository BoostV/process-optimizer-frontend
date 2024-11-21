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
  resolve: {
    alias: [{ find: '@core', replacement: resolve(__dirname, './src') }],
  },
  build: {
    minify: false,
    lib: {
      formats: ['es', 'umd'],
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'process-optimizer-core',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-hook-form',
        'immer',
        'md5',
        'compare-versions',
        '@boostv/process-optimizer-frontend-api',
      ],
      output: {
        globals: {
          react: 'React',
          'compare-versions': 'compareVersions',
          immer: 'produce',
          md5: 'md5',
          '@boostv/process-optimizer-frontend-api':
            'processOptimizerFrontendApi',
        },
      },
    },
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
