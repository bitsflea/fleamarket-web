import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'process','util'],
      globals: {
        Buffer: true, // can also be 'build', 'dev', or false
        global: true,
        process: true,
      }
    })],
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      plugins: [visualizer({ open: true })],
    }
  },
  optimizeDeps: {
    esbuildOptions: { target: 'es2022', supported: { bigint: true } }
  },
  resolve: {
    alias: {
      'crypto': 'crypto-browserify',
      'process': 'process/browser',
      'buffer': 'buffer',
      'util': 'util'
    }
  }
});