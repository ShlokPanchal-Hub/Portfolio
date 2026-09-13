import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    // Fingerprinted output gets its own path so the immutable cache rule in
    // public/_headers cannot also match the unhashed images in /assets/images.
    assetsDir: 'static',
    assetsInlineLimit: 2048,
    cssCodeSplit: false,
    target: 'es2020'
  },
  server: {
    port: 5173,
    open: true
  }
});
