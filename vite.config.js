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

function cspDynamicPlugin(env) {
  return {
    name: 'csp-dynamic',
    transformIndexHtml(html) {
      const apiBase = env.VITE_API_BASE_URL || '/api'
      const matomoHost = env.VITE_MATOMO_HOST || ''

      let apiOrigin = ''
      if (apiBase.startsWith('http')) {
        try {
          apiOrigin = new URL(apiBase).origin
        } catch { /* empty */ }
      }

      const scriptSrc = `'self' 'unsafe-inline'${matomoHost ? ` ${matomoHost}` : ''}`
      const connectSrc = `'self'${apiOrigin ? ` ${apiOrigin}` : ''}${matomoHost ? ` ${matomoHost}` : ''}`
      const imgSrc = `'self' data:${matomoHost ? ` ${matomoHost}` : ''}`
      const csp = `script-src ${scriptSrc}; connect-src ${connectSrc}; img-src ${imgSrc}; object-src 'self'`

      let result = html.replace(
        /<meta\s+http-equiv="Content-Security-Policy"[^>]*>/i,
        `<meta http-equiv="Content-Security-Policy" content="${csp}">`
      )

      result = result.replace(
        /<link\s+rel="stylesheet"\s+crossorigin\s+href="([^"]+)"\s*\/?>/i,
        (_, href) =>
          `<link rel="stylesheet" href="${href}" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`
      )

      return result
    }
  }
}

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
      // Nota: la compressione brotli on-the-fly è gestita dal server (.htaccess mod_brotli/lsmod_brotli).
      // I file .br precompressi non sono generati per evitare problemi di MIME type su LiteSpeed.
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifest: false,
        devOptions: {
          enabled: false,
        },
        workbox: {
          navigateFallback: 'index.html',
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
        verbose: true,
        disable: false,
        threshold: 1025,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      cspDynamicPlugin(env),
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
      target: 'esnext',
      minify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules') && !id.includes('.pnpm/')) {
              return 'vendor'
            }
          },
        },
      },
    },
    test: {
      environment: 'happy-dom',
      globals: true,
      setupFiles: ['src/__tests__/setup.js'],
      include: ['src/**/*.{test,spec}.{js,ts}'],
    },
  })
}
