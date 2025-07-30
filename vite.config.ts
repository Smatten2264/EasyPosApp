import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {// alt der starter med /api, bliver omformuleret til "https://devapi.skypos.dk/api"
        target: 'https://devapi.skypos.dk',
        changeOrigin: true,
        secure: false, // Gør at jeg kan komme igennem CORS lige nu. Så det virker. Selvom SSl sert ikke er "trusted" - måske fjernes? da jeg tror den ikke kalder CORS mere
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
