<template>
  <LoginContent
    :errorMessage="errorMessage"
    :verifiedMessage="verifiedMessage"
    @submit-login="submitLogin"
    @submit-forgot="submitForgot"
  />
</template>

<script setup>
import { axiosClient, withCSRF } from '@/axios'
import { router } from '@/router'
import useUserStore from '@/stores/user.js'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { migrateGuestTasks } from '@/composables/useGuestMigration'
import LoginContent from '@/components/LoginContent.vue'

const errorMessage = ref('')
const verifiedMessage = ref('')
const userStore = useUserStore()
const route = useRoute()

async function submitLogin(formData) {
  errorMessage.value = ''
  try {
    await withCSRF(() => axiosClient.post('/login', formData))
    userStore.clearSession()
    await userStore.fetchUser()
    await migrateGuestTasks()
    router.push({ name: 'Todo' })
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'An error occurred'
  }
}

function submitForgot(forgotEmail) {
  errorMessage.value = ''
  verifiedMessage.value = ''
  withCSRF(() =>
    axiosClient
      .post('/forgot-password', { email: forgotEmail })
      .then(() => {
        verifiedMessage.value = 'If this email exists, you will receive a reset link shortly.'
      })
      .catch((error) => {
        errorMessage.value = error.response?.data?.message || 'Failed to send reset email.'
      }),
  )
}

onMounted(async () => {
  if (!userStore.isUserLoaded) {
    try {
      await userStore.fetchUser()
    } catch {
      /* Ignora errori */
    }
  }
  if (userStore.user) router.replace({ name: 'Todo' })
  if (route.query.verified === '1') {
    verifiedMessage.value = 'Your email has been verified successfully.'
    router.replace({ path: '/login' })
  }
})
</script>
