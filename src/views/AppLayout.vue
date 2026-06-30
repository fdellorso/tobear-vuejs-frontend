<template>
  <div class="xl:grid xl:min-h-screen" :class="gridClasses">
    <!-- Sidebar sinistra (solo xl+) -->
    <DesktopSidebar
      class="hidden xl:flex xl:flex-col"
      :activePanel="activePanel"
      @openPanel="activePanel = $event"
    />

    <!-- Colonna centrale -->
    <div class="min-w-0">
      <!-- Header tradizionale (sotto xl, md+) -->
      <header class="hidden md:block xl:hidden bg-gray-800">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex h-16 items-center justify-between">
            <div class="flex items-center">
              <RouterLink to="/todo">
                <LogoIcon customClass="size-8" />
              </RouterLink>
              <nav class="ml-10 hidden lg:block">
                <RouterLink
                  to="/todo"
                  class="rounded-md px-3 py-2 text-sm font-medium"
                  :class="
                    $route.path === '/todo'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  "
                >
                  Todo
                </RouterLink>
              </nav>
            </div>
            <div class="flex items-center space-x-4">
              <template v-if="mode === 'authenticated' && user">
                <span class="text-sm text-gray-300">{{ user.name }}</span>
                <button
                  @click="logout"
                  class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Esci
                </button>
              </template>
              <template v-else>
                <RouterLink
                  to="/login"
                  class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Accedi
                </RouterLink>
                <RouterLink
                  to="/register"
                  class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
                >
                  Registrati
                </RouterLink>
              </template>
            </div>
          </div>
        </div>
      </header>

      <main class="pb-20 xl:pb-0">
        <RouterView />
      </main>
    </div>

    <!-- Pannello destro contestuale (solo xl+, quando attivo) -->
    <DesktopContentPanel
      v-if="activePanel"
      class="hidden xl:block"
      :section="activePanel"
      @close="activePanel = null"
    />
  </div>

  <MobileNavFab />
</template>

<script setup>
import { ref, computed } from 'vue'
import LogoIcon from '@/components/LogoIcon.vue'
import MobileNavFab from '@/components/MobileNavFab.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import DesktopContentPanel from '@/components/DesktopContentPanel.vue'
import useUserStore from '@/stores/user.js'
import { router } from '@/router'
import { axiosClient } from '@/axios'

const userStore = useUserStore()
const user = computed(() => userStore.user)
const mode = computed(() => userStore.mode)

const activePanel = ref(null)

const gridClasses = computed(() =>
  activePanel.value ? 'xl:grid-cols-[14rem_1fr_24rem]' : 'xl:grid-cols-[14rem_1fr]',
)

function logout() {
  axiosClient.post('/logout').then(() => {
    userStore.resetUser()
    router.push({ name: 'Home' })
  })
}
</script>
