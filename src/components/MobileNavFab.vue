<template>
  <Popover v-slot="{ close }" class="fixed bottom-6 left-6 z-50 md:hidden">
    <PopoverButton
      class="flex items-center justify-center rounded-full bg-gray-800 p-1 shadow-lg ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
    >
      <LogoIcon customClass="size-12" :noBorder="true" />
    </PopoverButton>

    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <PopoverPanel
        class="absolute bottom-full left-0 mb-3 w-48 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-gray-900/5"
      >
        <div class="py-1">
          <RouterLink
            @click="close"
            to="/about"
            class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            About
          </RouterLink>
          <RouterLink
            @click="close"
            to="/contact"
            class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            Contatti
          </RouterLink>
        </div>
        <hr class="border-t border-gray-100" />
        <div class="py-1">
          <template v-if="mode === 'guest'">
            <p class="px-4 py-2 text-xs text-gray-400">
              Modalità locale — crea un account per sincronizzare i task.
            </p>
            <RouterLink
              @click="close"
              to="/login"
              class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Accedi
            </RouterLink>
            <RouterLink
              @click="close"
              to="/register"
              class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Registrati
            </RouterLink>
          </template>
          <template v-else-if="mode === 'authenticated'">
            <span class="block px-4 py-2.5 text-sm font-medium text-gray-900">
              {{ user.name }}
            </span>
            <button
              @click="(close(), logout())"
              class="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Esci
            </button>
          </template>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import LogoIcon from '@/components/LogoIcon.vue'
import useUserStore from '@/stores/user.js'
import { router } from '@/router'
import { axiosClient } from '@/axios'
import { computed } from 'vue'

const userStore = useUserStore()
const user = computed(() => userStore.user)
const mode = computed(() => userStore.mode)

function logout() {
  axiosClient.post('/logout').then(() => {
    userStore.resetUser()
    router.push({ name: 'Home' })
  })
}
</script>
