import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    host: true, // Permite acceso desde la red local (IPs como 10.0.0.117)
    port: 5178,
    strictPort: true,
    proxy: {
      // Redirige /api a tu servidor de Laravel
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      // Redirige /storage para que las imágenes carguen en cualquier dispositivo
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Garabito Shop Santo Domingo',
        short_name: 'GarabitoShop',
        description: 'Tecnología, calidad y confianza en un solo lugar en Santo Domingo.',
        theme_color: '#2563EB',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
    }),
  ],
});
