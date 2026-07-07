<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="visible"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-sm rounded-2xl border border-tb-border bg-tb-surface shadow-xl px-4 py-3 md:hidden"
    >
      <button
        @click="dismiss"
        class="absolute top-2 right-2 p-1 rounded-full text-tb-text-sec hover:text-tb-text hover:bg-tb-nav-active transition-colors"
        :aria-label="$t('pwa.dismiss')"
      >
        <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div class="flex items-start gap-3 pr-6">
        <img src="/img/icons/icon-72x72.png" alt="toBear" class="size-10 rounded-xl shrink-0" />
        <div class="min-w-0">
          <p class="text-sm font-semibold text-tb-text">{{ $t('pwa.title') }}</p>
          <p class="mt-0.5 text-xs text-tb-text-sec leading-relaxed">
            {{ isIos ? $t('pwa.descriptionIos') : $t('pwa.description') }}
          </p>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-end gap-2">
        <button
          v-if="isIos"
          @click="dismiss"
          class="rounded-lg px-3 py-1.5 text-xs font-medium text-tb-text-sec hover:bg-tb-nav-active transition-colors"
        >
          {{ $t('pwa.understood') }}
        </button>
        <button
          v-else
          @click="install"
          class="rounded-lg bg-tb-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
        >
          {{ $t('pwa.install') }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const DISMISS_KEY = 'tobear_pwa_banner_dismissed'
const DISMISS_DAYS = 7

let deferredPrompt = null
const visible = ref(false)

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone =
  window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches

function isDismissed() {
  const val = localStorage.getItem(DISMISS_KEY)
  if (!val) return false
  const dismissedAt = parseInt(val)
  const days = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
  return days < DISMISS_DAYS
}

function cookieConsentAnswered() {
  return localStorage.getItem('matomo_consent') !== null
}

function tryShow() {
  if (isStandalone) return
  if (isDismissed()) return
  if (!cookieConsentAnswered()) return
  if (!isIos && !deferredPrompt) return
  visible.value = true
}

function dismiss() {
  visible.value = false
  localStorage.setItem(DISMISS_KEY, Date.now().toString())
}

async function install() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  if (outcome === 'accepted') {
    visible.value = false
  }
  deferredPrompt = null
}

function onBeforeInstallPrompt(e) {
  e.preventDefault()
  deferredPrompt = e
  tryShow()
}

// Ascolta cambio consenso cookie
function onStorageChange(e) {
  if (e.key === 'matomo_consent') {
    tryShow()
  }
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.addEventListener('storage', onStorageChange)
  tryShow()
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.removeEventListener('storage', onStorageChange)
})
</script>
