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
          {{ $t('nav.todo') }}
        </RouterLink>
        <button
          @click="$emit('openPanel', activePanel === 'about' ? null : 'about')"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
          :class="{ 'bg-tb-nav-active text-tb-text': activePanel === 'about' }"
        >
          <InformationCircleIcon class="size-4 shrink-0" />
          {{ $t('nav.about') }}
        </button>
        <button
          @click="$emit('openPanel', activePanel === 'contact' ? null : 'contact')"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
          :class="{ 'bg-tb-nav-active text-tb-text': activePanel === 'contact' }"
        >
          <EnvelopeIcon class="size-4 shrink-0" />
          {{ $t('nav.contact') }}
        </button>
        <button
          v-if="mode === 'authenticated'"
          @click="$emit('openPanel', activePanel === 'user' ? null : 'user')"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
          :class="{ 'bg-tb-nav-active text-tb-text': activePanel === 'user' }"
        >
          <UserIcon class="size-4 shrink-0" />
          {{ $t('nav.profile') }}
        </button>
        <button
          v-if="mode === 'authenticated'"
          @click="$emit('openPanel', activePanel === 'setting' ? null : 'setting')"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
          :class="{ 'bg-tb-nav-active text-tb-text': activePanel === 'setting' }"
        >
          <Cog6ToothIcon class="size-4 shrink-0" />
          {{ $t('nav.settings') }}
        </button>
      </nav>
    </div>

    <div>
      <div v-if="mode === 'authenticated' && user" class="mb-4 space-y-2">
        <p v-if="!statsLoading" class="text-xs text-tb-text-muted">
          {{ $t('profile.statsLine', { total: statsTotal, completed: statsCompleted }) }}
        </p>
        <p v-else class="h-4 w-24 animate-pulse rounded bg-tb-nav-active"></p>
      </div>

      <div class="border-t border-tb-border pt-4">
        <template v-if="mode === 'guest'">
          <p class="px-3 py-2 text-xs text-tb-text-muted">
            {{ $t('auth.localMode') }}
          </p>
          <template v-if="authEnabled">
            <button
              @click="$emit('openPanel', activePanel === 'login' ? null : 'login')"
              class="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
            >
              {{ $t('nav.signIn') }}
            </button>
            <button
              @click="$emit('openPanel', activePanel === 'register' ? null : 'register')"
              class="mt-1 flex w-full items-center rounded-md bg-tb-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {{ $t('nav.signUp') }}
            </button>
          </template>
        </template>
        <template v-else-if="mode === 'authenticated' && user">
          <div class="px-3 py-2 text-sm font-medium text-tb-text">{{ user.name }}</div>
          <button
            @click="logout"
            class="mt-1 flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
          >
            {{ $t('nav.signOut') }}
          </button>
        </template>
        <template v-else>
          <template v-if="authEnabled">
            <button
              @click="$emit('openPanel', activePanel === 'login' ? null : 'login')"
              class="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-tb-text-sec hover:bg-tb-nav-active hover:text-tb-text"
            >
              {{ $t('nav.signIn') }}
            </button>
            <button
              @click="$emit('openPanel', activePanel === 'register' ? null : 'register')"
              class="mt-1 flex w-full items-center rounded-md bg-tb-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {{ $t('nav.signUp') }}
            </button>
          </template>
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
        <div class="mt-2 flex items-center gap-1 rounded-lg border border-tb-border p-1">
          <button
            v-for="lang in localeOptions"
            :key="lang.value"
            @click="localeStore.setLocale(lang.value)"
            :title="lang.label"
            class="flex flex-1 items-center justify-center rounded-md p-1.5 text-xs font-medium text-tb-text-muted transition-colors hover:text-tb-text-sec"
            :class="{ 'bg-tb-nav-active text-tb-text-sec': localeStore.locale === lang.value }"
          >
            {{ lang.flag }}
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
import { useAuthEnabled } from '@/composables/useAuthEnabled'
import { useRoute } from 'vue-router'
import { useTaskStats } from '@/composables/useTaskStats'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import { useI18n } from 'vue-i18n'
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CheckIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  UserIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'

const { authEnabled } = useAuthEnabled()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const { t } = useI18n()

const themeOptions = [
  { value: 'light', label: t('theme.light'), icon: SunIcon },
  { value: 'dark', label: t('theme.dark'), icon: MoonIcon },
  { value: 'system', label: t('theme.system'), icon: ComputerDesktopIcon },
]

const localeOptions = [
  { value: 'en', label: 'English', flag: 'EN' },
  { value: 'it', label: 'Italiano', flag: 'IT' },
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

async function logout() {
  await withCSRF(() => axiosClient.post('/logout'))
  userStore.resetUser()
  router.push({ name: 'Todo' })
}

onMounted(fetchStats)
</script>
