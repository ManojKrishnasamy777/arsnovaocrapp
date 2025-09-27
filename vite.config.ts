import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['electron']
    }
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});