<template>
  <div class="mx-auto max-w-2xl px-4 py-4">
    <FormLayout></FormLayout>
  </div>
  <div class="max-w-xl mx-auto py-10 px-4">
    <h1 class="text-2xl font-bold mb-6">User Settings</h1>

    <div class="mb-6">
      <p class="text-gray-700"><strong>Email:</strong> {{ user.email }}</p>
      <p class="text-gray-700">
        <strong>Verified:</strong> {{ user.email_verified_at ? 'Yes' : 'No' }}
      </p>
    </div>

    <h2 class="text-lg font-semibold mb-4">Reset Password</h2>

    <div v-if="successMessage" class="mb-4 text-green-700 bg-green-100 p-3 rounded">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mb-4 text-red-700 bg-red-100 p-3 rounded">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="resetPassword" class="space-y-4">
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
        <input
          id="username"
          autocomplete="username"
          type="username"
          required
          value="user.mail"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">New Password</label>
        <input
          id="password"
          autocomplete="new-password"
          v-model="form.password"
          type="password"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div>
        <label for="password_confirmation" class="block text-sm font-medium text-gray-700"
          >Confirm Password</label
        >
        <input
          id="password_confirmation"
          autocomplete="new-password"
          v-model="form.password_confirmation"
          type="password"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <button
        type="submit"
        class="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Reset Password
      </button>
    </form>
  </div>
</template>

<script setup>
import FormLayout from '@/components/tailwindplus/FormLayout.vue'
import { ref } from 'vue'
import useUserStore from '@/stores/user.js'
import { axiosClient, withCSRF } from '@/axios'

const userStore = useUserStore()
const user = userStore.user

const form = ref({
  email: user.email,
  password: '',
  password_confirmation: '',
})

const successMessage = ref('')
const errorMessage = ref('')

const resetPassword = () => {
  errorMessage.value = ''
  successMessage.value = ''

  withCSRF(() =>
    axiosClient
      .post('/reset-password', {
        email: form.value.email,
        password: form.value.password,
        password_confirmation: form.value.password_confirmation,
      })
      .then(() => {
        successMessage.value = 'Password has been reset successfully.'
        form.value.password = ''
        form.value.password_confirmation = ''
      })
      .catch((error) => {
        errorMessage.value = error.response?.data?.message || 'Failed to reset password.'
      }),
  )
}
</script>

<style scoped></style>
