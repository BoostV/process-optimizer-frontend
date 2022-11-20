import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './openapi/index.ts',
      name: 'process-optimizer-api',
    },
  },
})
