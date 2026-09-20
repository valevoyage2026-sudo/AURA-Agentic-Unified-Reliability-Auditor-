import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  cacheDir: '/tmp/vite_aura_cache',
  server: {
    host: '0.0.0.0',
    port: 3005,
  },
});
