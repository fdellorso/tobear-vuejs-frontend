import './assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import VueMatomo from 'vue-matomo'

import App from './App.vue'
import { router } from '@/router'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(VueMatomo, {
  // Configure your matomo server and site by providing
  host: 'https://laravel.fritz.box:8080',
  siteId: 1,
})
app.mount('#app')

window._paq.push(['trackPageView']) //To track pageview

// Blocco orientamento per PWA installata (solo standalone, non browser normale)
if (
  window.navigator.standalone || // iOS Safari PWA
  window.matchMedia('(display-mode: standalone)').matches // Android/Chrome PWA
) {
  try {
    screen.orientation?.lock?.('portrait')
  } catch {
    // API non supportata — comportamento atteso su iOS e browser non-PWA.
    // Il manifest.webmanifest già include "orientation": "portrait" come hint.
    // Non è un bug: è un limite noto delle PWA cross-platform.
  }
}
