import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import process from 'process'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
// import MkCert from 'vite-plugin-mkcert'

import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    mode,
    base: env.VITE_BASE_URL,
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifest: false,
        devOptions: {
          enabled: false,
        },
        workbox: {
          navigateFallback: '/offline.html',
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/tobear\.x10\.mx\/api\/.*$/, // adatta alla tua API
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 86400,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:js|css|html|json|png|jpg|jpeg|svg|woff2?)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-resources',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 2592000, // 30 giorni
                },
              },
            },
          ],
        },
      }),
      // MkCert()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      // https: true,
      allowedHosts: ['laravel.fritz.box'],
    },
    build: {
      // minify: false,
      sourcemap: true,
    },
  })
}
