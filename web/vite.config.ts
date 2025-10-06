import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: true
  }
});
