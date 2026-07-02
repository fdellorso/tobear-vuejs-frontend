<template>
  <aside
    class="h-full overflow-y-auto border-l border-tb-border bg-tb-surface p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-tb-text-muted uppercase tracking-wider">
        {{
          {
            about: 'About',
            contact: 'Contatti',
            login: 'Sign in',
            register: 'Create account',
            user: 'Profile',
            setting: 'Settings',
          }[section] ?? section
        }}
      </h3>
      <button
        @click="$emit('close')"
        class="rounded p-1 text-tb-text-muted hover:bg-tb-nav-active hover:text-tb-text-sec"
      >
        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <AboutContent v-if="section === 'about'" />
    <ContactContent v-else-if="section === 'contact'" />
    <LoginContent
      v-else-if="section === 'login'"
      :inPanel="true"
      @submit-login="handlePanelLogin"
    />
    <RegisterContent v-else-if="section === 'register'" />
    <UserProfile v-else-if="section === 'user'" />
    <UserSettings v-else-if="section === 'setting'" />
  </aside>
</template>

<script setup>
import AboutContent from '@/components/AboutContent.vue'
import ContactContent from '@/components/ContactContent.vue'
import LoginContent from '@/components/LoginContent.vue'
import RegisterContent from '@/components/RegisterContent.vue'
import UserProfile from '@/pages/UserProfile.vue'
import UserSettings from '@/pages/UserSettings.vue'
import { axiosClient, withCSRF } from '@/axios'
import useUserStore from '@/stores/user.js'

defineProps({
  section: {
    type: String,
    default: null,
    validator: (v) =>
      v === null || ['about', 'contact', 'login', 'register', 'user', 'setting'].includes(v),
  },
})

const emit = defineEmits(['close', 'login-success'])
const userStore = useUserStore()

function handlePanelLogin(formData) {
  withCSRF(() =>
    axiosClient
      .post('/login', formData)
      .then(() => {
        userStore.clearSession()
        return userStore.fetchUser()
      })
      .then(() => {
        emit('login-success')
      }),
  )
}
</script>
