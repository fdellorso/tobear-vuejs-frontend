<template>
  <SignInPage
    :navigationRoutes="navigationRoutes"
    @submitLogin="submitLogin"
    @submitForgot="submitForgot"
  >
    <template v-slot:logo>&nbsp;</template>
    <template v-slot:message>
      <div v-if="verifiedMessage" class="mt-4 mx-4 p-3 rounded text-white bg-green-400">
        {{ verifiedMessage }}
      </div>
      <div v-if="errorMessage" class="mt-4 mx-4 p-3 rounded text-white bg-red-400">
        {{ errorMessage }}
      </div>
    </template>
  </SignInPage>
</template>

<script setup>
import { axiosClient, withCSRF } from '@/axios'
import { router, flatRoutes } from '@/router'
import { useRoute } from 'vue-router'
import useUserStore from '@/stores/user.js'
import { ref, onMounted } from 'vue'
import SignInPage from '@/components/tailwindplus/SignInPage.vue'
// import LoGo from '@/components/LoGo.vue'

const navigationRoutes = {
  register: flatRoutes.find((route) => route.name === 'Register')?.path,
}

const errorMessage = ref('')
const verifiedMessage = ref('')

const userStore = useUserStore()
const route = useRoute()

function submitLogin(formData) {
  errorMessage.value = ''

  withCSRF(() =>
    axiosClient
      .post('/login', formData)
      .then(() => {
        // localStorage.setItem('token', response.data.token)
        userStore.resetUser()
        router.push({ name: 'Todo' })
      })
      .catch((error) => {
        errorMessage.value = error.response?.data?.message || 'An error occurred'
      }),
  )
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
      // Ignora errori
    }
  }
  if (userStore.user) {
    router.replace({ name: 'Todo' })
  }

  if (route.query.verified === '1') {
    verifiedMessage.value = 'Your email has been verified successfully.'

    router.replace({ path: '/login' })
  }
})
</script>

<style scoped></style>
