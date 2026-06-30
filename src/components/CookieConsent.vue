<script setup>
import { ref, onMounted } from 'vue'

const visible = ref(false)

onMounted(() => {
  const consent = localStorage.getItem('matomo_consent')
  if (!consent) {
    visible.value = true
  }
})

function accetta() {
  localStorage.setItem('matomo_consent', 'accepted')
  window.__initMatomo && window.__initMatomo()
  visible.value = false
}

function rifiuta() {
  localStorage.setItem('matomo_consent', 'rejected')
  visible.value = false
}
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-y-4 bg-gray-900/95 px-6 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-x-6"
  >
    <p class="text-sm/6 text-gray-200">
      Usiamo Matomo (self-hosted) per capire come viene usato toBear. Nessun dato viene condiviso
      con terzi.
    </p>
    <div class="flex shrink-0 gap-x-3">
      <button
        type="button"
        class="rounded-md bg-white/10 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        @click="rifiuta"
      >
        Rifiuta
      </button>
      <button
        type="button"
        class="rounded-md bg-amber-500 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        @click="accetta"
      >
        Accetta
      </button>
    </div>
  </div>
</template>
