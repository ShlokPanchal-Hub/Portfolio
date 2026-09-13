import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 2048,
    cssCodeSplit: false,
    target: 'es2020'
  },
  server: {
    port: 5173,
    open: true
  }
});
