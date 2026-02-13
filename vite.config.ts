import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [
    react(),
  ],
  optimizeDeps: {
    include: ['mdui', 'chen-the-dawnstreak'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        topbar: resolve(__dirname, 'topbar.html'),
      },
    },
  },
});
