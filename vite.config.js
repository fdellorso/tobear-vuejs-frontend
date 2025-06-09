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
        // manifest: false,
        devOptions: {
          enabled: false
        },
        manifest: {
          "name": "tobear",
          "short_name": "tobear",
          "id": "/",
          "description": "An app to bear in mind",
          "background_color": "#fdf6ec",
          "theme_color": "#8b5e3c",
          "start_url": "https://tobear.gd.rf",
          "dir": "ltr",
          "scope": "https://tobear.gd.rf",
          "lang": "en",
          "orientation":"portrait",
          "display": "standalone",
          "display_override": [
            "fullscreen",
            "minimal-ui",
            "window-controls-overlay",
            "standalone",
            "browser"
          ],
          "iarc_rating_id": "e58c174a-81d2-5c3c-32cc-34b8de4a52e9",
          "related_applications": [
            {
              "platform": "play",
              "url": "https://play.google.com/store/apps/details?id=com.example.app1",
              "id": "com.example.app1"
            }
          ],
          "prefer_related_applications": true,
          "shortcuts": [
            {
              "name": "Todo List",
              "short_name": "Todo",
              "description": "View your todo list",
              "url": "/todo",
              "icons": [
                {
                  "src": "/img/icons/icon-192x192.png",
                  "sizes": "192x192"
                  }
              ]
            }
          ],
          "protocol_handlers": [
            {
              "protocol": "web+music",
              "url": "/play?track=%s"
            }
          ],
          "categories": ["productivity", "utilities", "social"],
          "edge_side_panel": {
            "preferred_width": 400
          },
          "icons": [
            {
              "src": "/img/icons/icon-512x512.png",
              "sizes": "512x512",
              "type": "image/png"
            },
            {
              "src": "/img/icons/icon-192x192.png",
              "sizes": "192x192",
              "type": "image/png"
            },
            {
              "src": "/img/icons/icon-144x144.png",
              "sizes": "144x144",
              "type": "image/png"
            },
            {
              "src": "/img/icons/icon-128x128.png",
              "sizes": "128x128",
              "type": "image/png"
            },
            {
              "src": "/img/icons/icon-96x96.png",
              "sizes": "96x96",
              "type": "image/png"
            },
            {
              "src": "/img/icons/icon-72x72.png",
              "sizes": "72x72",
              "type": "image/png"
            },
            {
              "src": "/img/icons/icon-48x48.png",
              "sizes": "48x48",
              "type": "image/png"
            },
            {
              "src": "/img/icons/icon-32x32.png",
              "sizes": "32x32",
              "type": "image/png"
            },
            {
              "src": "/img/icons/icon-16x16.png",
              "sizes": "16x16",
              "type": "image/png"
            },
            {
              "src": "/img/icons/icon-180x180.png",
              "sizes": "180x180",
              "type": "image/png"
            }
          ],
          "screenshots": [
            {
              "src": "/img/icons/icon-512x512.png",
              "sizes": "512x512",
              "type": "image/png"
            }
          ],
          "share_target": {
            "action": "/handle-shared-content/",
            "method": "GET",
            "params": {
              "title": "title",
              "url": "url"
            }
          },
          "file_handlers": [
            {
              "action": "/open-text",
              "accept": {
                "application/pdf": [".txt"]
              },
              "icons": [
                {
                  "src": "txt-icon.png",
                  "sizes": "256x256",
                  "type": "image/png"
                }
              ],
              "launch_type": "single-client"
            }
          ],
          "launch_handler": {
            "client_mode": ["focus-existing", "auto"]
          },
          "handle_links": "preferred",
          "scope_extensions": [
            { "type": "origin", "origin": "https://tobear.gd.rf" }
          ]
        }
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
