import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Yeni versiyon gelirse arka planda otomatik güncelle
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'maskable-icon.png'],
      manifest: {
        name: 'FamilyFinance',
        short_name: 'FamilyFinance',
        description: 'Aile ve Kişisel Finans Takip Uygulaması',
        theme_color: '#0f172a',      // Telefonun üst bar rengi (Koyu gri/lacivert yaptık)
        background_color: '#0f172a', // Açılış ekranı (Splash) arka plan rengi
        display: 'standalone',       // Tarayıcı barlarını gizle, gerçek uygulama gibi açıl
        orientation: 'portrait',     // Sadece dikey modda çalışsın
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Android telefonlarda ikonun kırpılabilmesini sağlar
          }
        ]
      }
    })
  ]
});