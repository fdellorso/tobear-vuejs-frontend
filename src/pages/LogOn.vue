<script setup>
import { axiosClient, withCSRF } from '@/axios'
import router from '@/router'
import { useRoute } from 'vue-router'
import useUserStore from '@/stores/user.js'
import { ref, onMounted } from 'vue'

const data = ref({
  email: '',
  password: '',
})

const errorMessage = ref('')
const verifiedMessage = ref('')

const userStore = useUserStore()
const route = useRoute()

// stato forgot password
const forgotMode = ref(false)
const forgotEmail = ref('')
const forgotMessage = ref('')
const forgotError = ref('')
const isSendingForgot = ref(false)

// login
function submitLogin() {
  errorMessage.value = ''
  withCSRF(() =>
    axiosClient.post('/login', data.value)
      .then(() => {
        userStore.resetUser()
        router.push({ name: 'Todo' })
      })
      .catch(err => {
        errorMessage.value = err.response?.data?.message || 'An error occurred'
      })
  )
}

// richiesta reset password
function submitForgot() {
  forgotError.value = ''
  forgotMessage.value = ''
  isSendingForgot.value = true
  withCSRF(() =>
    axiosClient.post('/forgot-password', { email: forgotEmail.value })
      .then(() => {
        forgotMessage.value = 'If this email exists, you will receive a reset link shortly.'
      })
      .catch(err => {
        forgotError.value = err.response?.data?.message || 'Failed to send reset email.'
      })
      .finally(() => { isSendingForgot.value = false })
  )
}

// mostra messaggio verify=1 se presente
onMounted(() => {
  if (route.query.verified === '1') {
    verifiedMessage.value = 'Your email has been verified successfully.'

    router.replace({ path: '/login' })
  }
})
</script>

<template>
  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <h2 class="text-center text-2xl font-bold">Sign in to your account</h2>

    <!-- email verificata -->
    <div v-if="verifiedMessage" class="mt-4 p-3 bg-green-100 text-green-800 rounded">
      {{ verifiedMessage }}
    </div>

    <!-- errore login -->
    <div v-if="errorMessage && !forgotMode" class="mt-4 p-3 bg-red-100 text-red-800 rounded">
      {{ errorMessage }}
    </div>

    <!-- Forgot Password mode -->
    <div v-if="forgotMode" class="mt-4 bg-white p-6 rounded shadow">
      <h3 class="text-lg font-medium mb-2">Reset your password</h3>

      <div v-if="forgotMessage" class="mb-3 p-2 bg-green-100 text-green-800 rounded">
        {{ forgotMessage }}
      </div>
      <div v-if="forgotError" class="mb-3 p-2 bg-red-100 text-red-800 rounded">
        {{ forgotError }}
      </div>

      <input
        v-model="forgotEmail"
        type="email"
        placeholder="Enter your email"
        class="w-full mb-3 px-3 py-2 border rounded"
      />
      <button
        @click="submitForgot"
        :disabled="isSendingForgot || !forgotEmail"
        class="w-full py-2 bg-blue-800 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {{ isSendingForgot ? 'Sending…' : 'Send Reset Link' }}
      </button>
      <button
        @click="forgotMode = false"
        class="mt-3 text-sm text-gray-600 hover:underline"
      >
        ← Back to Login
      </button>
    </div>

    <!-- Login form -->
    <form v-else @submit.prevent="submitLogin" class="mt-4 bg-white p-6 rounded shadow space-y-4">
      <div>
        <label class="block text-sm">Email address</label>
        <input
          v-model="data.email"
          type="email"
          required
          class="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label class="flex text-sm justify-between">
          <span>Password</span>
          <button type="button" @click="forgotMode = true" class="text-sm text-blue-600 hover:underline">
            Forgot password?
          </button>
        </label>
        <input
          v-model="data.password"
          type="password"
          required
          class="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        class="w-full py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
      >
        Sign in
      </button>

      <p class="mt-4 text-center text-sm text-gray-600">
        Not a member?
        <RouterLink to="{ name: 'Register' }" class="text-blue-600 hover:underline">
          Create an account
        </RouterLink>
      </p>
    </form>
  </div>
</template>

<style scoped></style>
