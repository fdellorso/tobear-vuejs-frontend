<template>
  <div v-if="user" class="mx-auto max-w-2xl px-4 py-8 min-h-screen">
    <div class="mb-8">
      <h1 class="text-xl font-semibold text-tb-text">{{ $t('settings.title') }}</h1>
      <p class="mt-1 text-sm text-tb-text-muted">{{ $t('settings.subtitle') }}</p>
    </div>

    <!-- Info account -->
    <div class="mb-8 rounded-xl border border-tb-border bg-tb-surface p-4">
      <h2 class="mb-3 text-xs font-medium uppercase tracking-wider text-tb-text-muted">
        {{ $t('settings.accountSection') }}
      </h2>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm text-tb-text-sec">{{ $t('settings.emailLabel') }}</span>
          <span class="text-sm font-medium text-tb-text">{{ user.email }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-tb-text-sec">{{ $t('settings.verifiedLabel') }}</span>
          <span
            class="text-sm font-medium"
            :class="user.email_verified_at ? 'text-tb-success' : 'text-tb-danger'"
          >
            {{ user.email_verified_at ? $t('settings.verifiedYes') : $t('settings.verifiedNo') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Cambio password -->
    <div class="rounded-xl border border-tb-border bg-tb-surface p-4">
      <h2 class="mb-4 text-xs font-medium uppercase tracking-wider text-tb-text-muted">
        {{ $t('settings.passwordSection') }}
      </h2>
      <div
        v-if="successMessage"
        class="mb-4 rounded-lg bg-tb-success-bg p-3 text-sm text-tb-success"
      >
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="mb-4 rounded-lg bg-tb-danger-bg p-3 text-sm text-tb-danger">
        {{ errorMessage }}
      </div>
      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label for="current_password" class="block text-sm font-medium text-tb-text-sec">{{
            $t('auth.currentPasswordLabel')
          }}</label>
          <input
            id="current_password"
            v-model="form.current_password"
            type="password"
            autocomplete="current-password"
            required
            class="mt-1 block w-full rounded-lg border border-tb-border bg-tb-bg px-3 py-2 text-sm text-tb-text placeholder:text-tb-text-muted focus:border-tb-accent focus:outline-none"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-tb-text-sec">{{
            $t('auth.newPasswordLabel')
          }}</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            required
            class="mt-1 block w-full rounded-lg border border-tb-border bg-tb-bg px-3 py-2 text-sm text-tb-text placeholder:text-tb-text-muted focus:border-tb-accent focus:outline-none"
          />
        </div>
        <div>
          <label for="password_confirmation" class="block text-sm font-medium text-tb-text-sec">{{
            $t('auth.confirmPasswordLabel')
          }}</label>
          <input
            id="password_confirmation"
            v-model="form.password_confirmation"
            type="password"
            autocomplete="new-password"
            required
            class="mt-1 block w-full rounded-lg border border-tb-border bg-tb-bg px-3 py-2 text-sm text-tb-text placeholder:text-tb-text-muted focus:border-tb-accent focus:outline-none"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-tb-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? $t('auth.saving') : $t('auth.updatePassword') }}
        </button>
      </form>
    </div>
  </div>

  <div v-else class="mx-auto max-w-2xl px-4 py-8 text-center min-h-screen">
    <p class="text-sm text-tb-text-muted">{{ $t('auth.notLoggedInSettings') }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import useUserStore from '@/stores/user.js'
import { axiosClient, withCSRF } from '@/axios'

const { t } = useI18n()

const userStore = useUserStore()
const user = computed(() => userStore.user)

const form = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function changePassword() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    await withCSRF(() =>
      axiosClient.put('/password', {
        current_password: form.value.current_password,
        password: form.value.password,
        password_confirmation: form.value.password_confirmation,
      }),
    )
    successMessage.value = t('settings.passwordSuccess')
    form.value.current_password = ''
    form.value.password = ''
    form.value.password_confirmation = ''
  } catch (error) {
    errorMessage.value = error.response?.data?.message || t('settings.passwordError')
  } finally {
    loading.value = false
  }
}
</script>
