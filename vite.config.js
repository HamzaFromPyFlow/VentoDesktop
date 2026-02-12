import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: './renderer',
  base: './',
  // Load .env file from the parent directory (VentoDesktop root)
  envDir: path.resolve(__dirname),
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './renderer'),
      '@lib': path.resolve(__dirname, './renderer/lib'),
      '@schema': path.resolve(__dirname, './renderer/schema'),
      '@stores': path.resolve(__dirname, './renderer/stores')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api']
      }
    }
  }
});
