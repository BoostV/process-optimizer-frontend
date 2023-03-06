// vite.config.ts
import { defineConfig } from 'file:///workspaces/process-optimizer-frontend/node_modules/vite/dist/node/index.js'
import { resolve } from 'path'
import react from 'file:///workspaces/process-optimizer-frontend/node_modules/@vitejs/plugin-react/dist/index.mjs'
import dts from 'file:///workspaces/process-optimizer-frontend/node_modules/vite-plugin-dts/dist/index.mjs'
var __vite_injected_original_dirname =
  '/workspaces/process-optimizer-frontend/packages/core'
var vite_config_default = defineConfig({
  plugins: [dts(), react()],
  resolve: {
    alias: [
      {
        find: '@core',
        replacement: resolve(__vite_injected_original_dirname, './src'),
      },
    ],
  },
  build: {
    sourcemap: true,
    target: 'esnext',
    minify: false,
    lib: {
      entry: resolve(__vite_injected_original_dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-hook-form'],
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
export { vite_config_default as default }
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvd29ya3NwYWNlcy9wcm9jZXNzLW9wdGltaXplci1mcm9udGVuZC9wYWNrYWdlcy9jb3JlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvd29ya3NwYWNlcy9wcm9jZXNzLW9wdGltaXplci1mcm9udGVuZC9wYWNrYWdlcy9jb3JlL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy93b3Jrc3BhY2VzL3Byb2Nlc3Mtb3B0aW1pemVyLWZyb250ZW5kL3BhY2thZ2VzL2NvcmUvdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cydcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW2R0cygpLCByZWFjdCgpXSxcblxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IFt7IGZpbmQ6ICdAY29yZScsIHJlcGxhY2VtZW50OiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJykgfV0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgbWluaWZ5OiBmYWxzZSxcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9pbmRleC50cycpLFxuICAgICAgZm9ybWF0czogWydlcyddLFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LWhvb2stZm9ybSddLFxuICAgIH0sXG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBjb3ZlcmFnZToge1xuICAgICAgcmVwb3J0ZXI6IFsnbGNvdicsICd0ZXh0LXN1bW1hcnknXSxcbiAgICB9LFxuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgc2V0dXBGaWxlczogJy4vc3JjL3Rlc3Rpbmcvc2V0dXBUZXN0cy50cycsXG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsZUFBZTtBQUN4QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxTQUFTO0FBSmhCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO0FBQUEsRUFFeEIsU0FBUztBQUFBLElBQ1AsT0FBTyxDQUFDLEVBQUUsTUFBTSxTQUFTLGFBQWEsUUFBUSxrQ0FBVyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQ3JFO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsSUFDUixLQUFLO0FBQUEsTUFDSCxPQUFPLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQ3hDLFNBQVMsQ0FBQyxJQUFJO0FBQUEsSUFDaEI7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxTQUFTLGFBQWEsaUJBQWlCO0FBQUEsSUFDcEQ7QUFBQSxJQUNBLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDSixVQUFVO0FBQUEsTUFDUixVQUFVLENBQUMsUUFBUSxjQUFjO0FBQUEsSUFDbkM7QUFBQSxJQUNBLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxFQUNkO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
