<template>
  <div class="min-h-screen max-w-md mx-auto py-16 px-6 text-center">
    <h1 class="text-2xl font-bold text-tb-text mb-4">{{ $t('verify.title') }}</h1>
    <p class="text-tb-text-sec mb-6">
      {{ $t('verify.message') }}
    </p>

    <div v-if="successMessage" class="mb-4 text-tb-success bg-tb-success-bg p-3 rounded">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mb-4 text-tb-danger bg-tb-danger-bg p-3 rounded">
      {{ errorMessage }}
    </div>

    <button
      @click="resendVerification"
      :disabled="isSending"
      class="bg-tb-accent text-white px-4 py-2 rounded hover:opacity-90 transition disabled:opacity-50"
    >
      {{ isSending ? $t('verify.sending') : $t('verify.resend') }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { axiosClient, withCSRF } from '@/axios'

const { t } = useI18n()

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
        successMessage.value = t('verify.success')
      })
      .catch((error) => {
        errorMessage.value = error.response?.data?.message || t('verify.error')
      })
      .finally(() => {
        isSending.value = false
      }),
  )
}
</script>

<style scoped></style>
