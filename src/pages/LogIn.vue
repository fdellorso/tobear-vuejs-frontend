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

  // axiosCSRF.get('/sanctum/csrf-cookie').then(() => {
  withCSRF(() =>
    axiosClient.post('/login', data.value)
      .then(() => {
        // localStorage.setItem('token', response.data.token)
        userStore.resetUser()
        router.push({ name: 'Todo' })
      })
      .catch((error) => {
        errorMessage.value = error.response?.data?.message || 'An error occurred'
      })
    )
  // })
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
      .catch((error) => {
        forgotError.value = error.response?.data?.message || 'Failed to send reset email.'
      })
      .finally(() => { isSendingForgot.value = false })
  )
}

// Mostra il messaggio se la query ha ?verified=1
onMounted(() => {
  if (route.query.verified === '1') {
    verifiedMessage.value = 'Your email has been verified successfully.'

    // Rimuovi ?verified=1 dalla URL senza ricaricare
    router.replace({ path: '/login' })
  }
})
</script>

<template>
  <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
    Sign in to your account
  </h2>

  <!-- ✅ Mostra messaggio email verificata -->
  <div v-if="verifiedMessage" class="mt-4 p-3 rounded text-white bg-green-500">
    {{ verifiedMessage }}
  </div>

  <div v-if="errorMessage" class="mt-4 p-3 rounded text-white bg-red-400">
    {{ errorMessage }}
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
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
    <form v-else @submit.prevent="submitLogin" class="space-y-6">
      <div>
        <label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
        <div class="mt-2">
          <input
            type="email"
            name="email"
            id="email"
            autocomplete="email"
            required=""
            v-model="data.email"
            class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <!-- <label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>
          <div class="text-sm">
            <a href="#" class="font-semibold text-blue-800 hover:text-blue-700">Forgot password?</a>
          </div> -->
          <span>Password</span>
          <button type="button" @click="forgotMode = true" class="text-sm text-blue-600 hover:underline">
            Forgot password?
          </button>
        </div>
        <div class="mt-2">
          <input
            type="password"
            name="password"
            id="password"
            autocomplete="current-password"
            required=""
            v-model="data.password"
            class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          class="flex w-full justify-center rounded-md bg-blue-800 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Sign in
        </button>
      </div>
    </form>

    <p class="mt-10 text-center text-sm/6 text-gray-500">
      Not a member?
      {{ ' ' }}
      <RouterLink :to="{ name: 'Register' }" class="font-semibold text-blue-800 hover:text-blue-700"
        >Create an account</RouterLink
      >
    </p>
  </div>
</template>

<style scoped></style>
