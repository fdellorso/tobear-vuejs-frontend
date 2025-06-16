<template>
  <div class="max-w-md mx-auto py-16 px-6 text-center">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">Account Created Successfully</h1>
    <p class="text-gray-700 mb-6">
      A verification email has been sent to your email address. Please check your inbox and follow
      the link to verify your account.
    </p>

    <div v-if="successMessage" class="mb-4 text-green-700 bg-green-100 p-3 rounded">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mb-4 text-red-700 bg-red-100 p-3 rounded">
      {{ errorMessage }}
    </div>

    <button
      @click="resendVerification"
      :disabled="isSending"
      class="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
    >
      {{ isSending ? 'Sending...' : 'Resend Verification Email' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { axiosClient, withCSRF } from '@/axios'

const successMessage = ref('')
const errorMessage = ref('')
const isSending = ref(false)

const resendVerification = () => {
  isSending.value = true
  errorMessage.value = ''
  successMessage.value = ''

  withCSRF(() =>
    axiosClient
      .post('/email/verification-notification')
      .then(() => {
        successMessage.value = 'Verification email has been resent successfully.'
      })
      .catch((error) => {
        errorMessage.value = error.response?.data?.message || 'Failed to resend email.'
      })
      .finally(() => {
        isSending.value = false
      }),
  )
}
</script>

<style scoped></style>
