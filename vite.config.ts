import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // alt der starter med /api, bliver omformuleret til "https://devapi.skypos.dk/api"
        target: 'https://devapi.skypos.dk',
        changeOrigin: true,
        secure: false, // Gør at jeg kan komme igennem CORS lige nu. Selvom SSL cert ikke er "trusted"
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'Z:/Mathias/React Projekt/React Build Projekter', // <-- direkte til Z-drevet
    emptyOutDir: true // Sletter indhold i mappen før nyt build
  }
});
