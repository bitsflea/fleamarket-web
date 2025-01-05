import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      plugins: [visualizer({ open: true })],
    }
  },
  resolve: {
    alias: {
      'process': 'process/browser',
      'buffer': 'buffer',
      'util': 'util'
    }
  },
  define: {
    'process.env': {},
    global: {}
  }
});