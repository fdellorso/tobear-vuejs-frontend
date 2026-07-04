import './assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from '@/i18n'

import VueMatomo from 'vue-matomo'

import App from './App.vue'
import { router } from '@/router'
import { useThemeStore } from '@/stores/theme'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(i18n)

const themeStore = useThemeStore()
themeStore.init()

function initMatomo(appInstance) {
  const host = import.meta.env.VITE_MATOMO_HOST
  const siteId = import.meta.env.VITE_MATOMO_SITE_ID
  if (!host || !siteId) {
    return
  }
  appInstance.use(VueMatomo, {
    host,
    siteId,
    router,
  })
}

const consent = localStorage.getItem('matomo_consent')
if (consent === 'accepted') {
  initMatomo(app)
}

app.mount('#app')

window.__initMatomo = function () {
  if (localStorage.getItem('matomo_consent') === 'accepted') {
    initMatomo(app)
  }
}

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
