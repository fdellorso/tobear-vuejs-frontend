<template>
  <Popover v-slot="{ close }" class="fixed bottom-6 left-6 z-50 xl:hidden">
    <PopoverButton
      class="flex items-center justify-center focus:outline-none rounded-full shadow-lg cursor-pointer"
    >
      <LogoIcon customClass="size-14" :noBorder="true" />
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
        class="absolute bottom-full left-0 mb-3 w-48 overflow-hidden rounded-xl bg-tb-surface shadow-lg ring-1 ring-tb-text/5"
      >
        <div class="py-1">
          <button
            @click="
              () => {
                router.push('/todo')
                close()
              }
            "
            class="block w-full px-4 py-2.5 text-left text-sm"
            :class="
              isTodoActive
                ? 'bg-tb-nav-active text-tb-text font-medium'
                : 'text-tb-text-sec hover:bg-tb-surface-2 hover:text-tb-text'
            "
          >
            {{ $t('nav.todo') }}
          </button>
          <RouterLink
            @click="close"
            to="/about"
            class="block px-4 py-2.5 text-sm text-tb-text-sec hover:bg-tb-surface-2 hover:text-tb-text"
          >
            {{ $t('nav.about') }}
          </RouterLink>
          <RouterLink
            @click="close"
            to="/contact"
            class="block px-4 py-2.5 text-sm text-tb-text-sec hover:bg-tb-surface-2 hover:text-tb-text"
          >
            {{ $t('nav.contact') }}
          </RouterLink>
        </div>
        <hr class="border-t border-tb-border" />
        <div class="py-1">
          <template v-if="mode === 'guest'">
            <p class="px-4 py-2 text-xs text-tb-text-muted">
              {{ $t('auth.localMode') }}
            </p>
            <RouterLink
              @click="close"
              to="/login"
              class="block px-4 py-2.5 text-sm text-tb-text-sec hover:bg-tb-surface-2 hover:text-tb-text"
            >
              {{ $t('nav.signIn') }}
            </RouterLink>
            <RouterLink
              @click="close"
              to="/register"
              class="block px-4 py-2.5 text-sm text-tb-text-sec hover:bg-tb-surface-2 hover:text-tb-text"
            >
              {{ $t('nav.signUp') }}
            </RouterLink>
          </template>
          <template v-else-if="mode === 'authenticated'">
            <span class="block px-4 py-2.5 text-sm font-medium text-tb-text">
              {{ user.name }}
            </span>
            <button
              @click="(close(), logout())"
              class="block w-full px-4 py-2.5 text-left text-sm text-tb-text-sec hover:bg-tb-surface-2 hover:text-tb-text"
            >
              {{ $t('nav.signOut') }}
            </button>
          </template>
        </div>
        <div class="border-t border-tb-border px-3 py-2">
          <div class="flex items-center gap-1 rounded-lg border border-tb-border p-1">
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
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import LogoIcon from '@/components/LogoIcon.vue'
import useUserStore from '@/stores/user.js'
import { useRoute } from 'vue-router'
import { router } from '@/router'
import { axiosClient } from '@/axios'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import { useI18n } from 'vue-i18n'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline'

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

const userStore = useUserStore()
const user = computed(() => userStore.user)
const mode = computed(() => userStore.mode)
const route = useRoute()
const isTodoActive = computed(() => route.path === '/todo')

function logout() {
  axiosClient.post('/logout').then(() => {
    userStore.resetUser()
    router.push({ name: 'Home' })
  })
}
</script>
