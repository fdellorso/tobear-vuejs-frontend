<template>
  <aside class="flex h-full flex-col justify-between border-r border-tb-border bg-tb-surface-2 p-4">
    <div
      class="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div class="mb-6 flex items-center gap-3">
        <RouterLink to="/todo">
          <LogoIcon customClass="size-9" :noBorder="true" />
        </RouterLink>
        <span class="text-lg font-medium text-tb-text">toBear</span>
      </div>

      <nav class="space-y-1">
        <RouterLink
          to="/todo"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
          :class="{ 'bg-tb-nav-active text-tb-text': route.path === '/todo' }"
        >
          <CheckIcon class="size-4 shrink-0" />
          Todo
        </RouterLink>
        <button
          @click="$emit('openPanel', activePanel === 'about' ? null : 'about')"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
          :class="{ 'bg-tb-nav-active text-tb-text': activePanel === 'about' }"
        >
          <InformationCircleIcon class="size-4 shrink-0" />
          About
        </button>
        <button
          @click="$emit('openPanel', activePanel === 'contact' ? null : 'contact')"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
          :class="{ 'bg-tb-nav-active text-tb-text': activePanel === 'contact' }"
        >
          <EnvelopeIcon class="size-4 shrink-0" />
          Contatti
        </button>
        <button
          v-if="mode === 'authenticated'"
          @click="$emit('openPanel', activePanel === 'user' ? null : 'user')"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
          :class="{ 'bg-tb-nav-active text-tb-text': activePanel === 'user' }"
        >
          <UserIcon class="size-4 shrink-0" />
          Profile
        </button>
      </nav>
    </div>

    <div>
      <div v-if="mode === 'authenticated' && user" class="mb-4 space-y-2">
        <p v-if="!statsLoading" class="text-xs text-tb-text-muted">
          <span class="font-medium text-tb-text-sec">{{ statsTotal }}</span> task di cui
          <span class="font-medium text-tb-success">{{ statsCompleted }}</span> completati
        </p>
        <p v-else class="h-4 w-24 animate-pulse rounded bg-tb-nav-active"></p>
      </div>

      <div class="border-t border-tb-border pt-4">
        <template v-if="mode === 'guest'">
          <p class="px-3 py-2 text-xs text-tb-text-muted">
            Modalità locale — crea un account per sincronizzare i task.
          </p>
          <button
            @click="$emit('openPanel', activePanel === 'login' ? null : 'login')"
            class="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
          >
            Accedi
          </button>
          <button
            @click="$emit('openPanel', activePanel === 'register' ? null : 'register')"
            class="mt-1 flex w-full items-center rounded-md bg-tb-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Registrati
          </button>
        </template>
        <template v-else-if="mode === 'authenticated' && user">
          <div class="px-3 py-2 text-sm font-medium text-tb-text">{{ user.name }}</div>
          <button
            @click="logout"
            class="mt-1 flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
          >
            Esci
          </button>
        </template>
        <template v-else>
          <button
            @click="$emit('openPanel', activePanel === 'login' ? null : 'login')"
            class="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
          >
            Accedi
          </button>
          <button
            @click="$emit('openPanel', activePanel === 'register' ? null : 'register')"
            class="mt-1 flex w-full items-center rounded-md bg-tb-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Registrati
          </button>
        </template>

        <div class="mt-3 flex items-center gap-1 rounded-lg border border-tb-border p-1">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            @click="themeStore.setTheme(option.value)"
            :title="option.label"
            class="flex flex-1 items-center justify-center rounded-md p-1.5 text-tb-text-muted transition-colors hover:text-tb-text-sec"
            :class="{ 'bg-tb-nav-active text-tb-text-sec': themeStore.theme === option.value }"
          >
            <component :is="option.icon" class="size-4" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import LogoIcon from '@/components/LogoIcon.vue'
import useUserStore from '@/stores/user.js'
import { router } from '@/router'
import { axiosClient, withCSRF } from '@/axios'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStats } from '@/composables/useTaskStats'
import { useThemeStore } from '@/stores/theme'
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CheckIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'

const themeStore = useThemeStore()

const themeOptions = [
  { value: 'light', label: 'Chiaro', icon: SunIcon },
  { value: 'dark', label: 'Scuro', icon: MoonIcon },
  { value: 'system', label: 'Sistema', icon: ComputerDesktopIcon },
]

defineProps({
  activePanel: {
    type: String,
    default: null,
  },
})

defineEmits(['openPanel'])

const route = useRoute()

const userStore = useUserStore()
const user = computed(() => userStore.user)
const mode = computed(() => userStore.mode)

const { taskCount, completedCount, loading: statsLoading, fetchStats } = useTaskStats()
const statsTotal = computed(() => taskCount.value)
const statsCompleted = computed(() => completedCount.value)

function logout() {
  withCSRF(() =>
    axiosClient.post('/logout').then(() => {
      userStore.resetUser()
      router.push({ name: 'Home' })
    }),
  )
}

onMounted(fetchStats)
</script>
