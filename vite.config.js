import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import process from 'process'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression'
// import MkCert from 'vite-plugin-mkcert'

import Markdown from 'unplugin-vue-markdown/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    mode,
    base: env.VITE_BASE_URL || '/',
    plugins: [
      vue({
        include: [/\.vue$/, /\.md$/],
      }),
      Markdown({
        markdownItOptions: {
          html: true,
          linkify: true,
          typographer: true,
        },
      }),
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
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: /\/api\//,
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
      viteCompression({
        verbose: true, // logga i file compressi
        disable: false, // abilita la compressione (disabilita in dev se vuoi)
        threshold: 1025, // comprime solo file > 10 KB
        algorithm: 'gzip',
        ext: '.gz', // estensione del file generato
      }),
      // MkCert(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3001,
      https: false,
      allowedHosts: ['laravel.fritz.box'],
    },
    build: {
      minify: true,
      sourcemap: false,
    },
    test: {
      environment: 'happy-dom',
      globals: true,
      setupFiles: ['src/__tests__/setup.js'],
      include: ['src/**/*.{test,spec}.{js,ts}'],
    },
  })
}
