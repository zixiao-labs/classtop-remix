import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { chen } from 'chen-the-dawnstreak/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    chen(),
  ],
});
