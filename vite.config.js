import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import process from 'process'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

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
          enabled: false
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: ['laravel.fritz.box'],
    },
    build: {
      // minify: false,
      sourcemap: true,
    },
  })
}
