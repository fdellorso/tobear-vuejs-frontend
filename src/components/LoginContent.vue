<template>
  <div class="mx-auto max-w-md px-4 py-8 min-h-screen">
    <h2 class="mb-6 text-xl font-semibold text-tb-text">{{ $t('auth.signInTitle') }}</h2>

    <div
      v-if="verifiedMessage"
      class="mb-4 rounded-lg bg-tb-success-bg p-3 text-sm text-tb-success"
    >
      {{ verifiedMessage }}
    </div>
    <div v-if="errorMessage" class="mb-4 rounded-lg bg-tb-danger-bg p-3 text-sm text-tb-danger">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label for="login-email" class="block text-sm font-medium text-tb-text-sec">{{
          $t('auth.emailLabel')
        }}</label>
        <input
          id="login-email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          required
          class="mt-1 block w-full rounded-lg border border-tb-border bg-tb-surface px-3 py-2 text-sm text-tb-text placeholder:text-tb-text-muted focus:border-tb-accent focus:outline-none"
        />
      </div>
      <div>
        <label for="login-password" class="block text-sm font-medium text-tb-text-sec">{{
          $t('auth.passwordLabel')
        }}</label>
        <input
          id="login-password"
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          required
          class="mt-1 block w-full rounded-lg border border-tb-border bg-tb-surface px-3 py-2 text-sm text-tb-text placeholder:text-tb-text-muted focus:border-tb-accent focus:outline-none"
        />
      </div>
      <button
        type="submit"
        class="w-full rounded-lg bg-tb-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
      >
        {{ $t('auth.signInTitle') }}
      </button>
    </form>

    <div class="mt-4 text-center">
      <button
        @click="showForgot = !showForgot"
        class="text-sm text-tb-text-muted hover:text-tb-text-sec"
      >
        {{ $t('auth.forgotPassword') }}
      </button>
    </div>

    <div v-if="showForgot" class="mt-4 space-y-3">
      <input
        v-model="forgotEmail"
        type="email"
        :placeholder="t('auth.emailLabel')"
        class="block w-full rounded-lg border border-tb-border bg-tb-surface px-3 py-2 text-sm text-tb-text placeholder:text-tb-text-muted focus:border-tb-accent focus:outline-none"
      />
      <button
        @click="handleForgot"
        class="w-full rounded-lg border border-tb-border px-4 py-2 text-sm text-tb-text-sec hover:bg-tb-nav-active transition-colors"
      >
        {{ $t('auth.sendResetLink') }}
      </button>
    </div>

    <p class="mt-6 text-center text-sm text-tb-text-muted">
      {{ $t('auth.noAccount') }}
      <RouterLink to="/register" class="font-medium text-tb-accent hover:opacity-80">{{
        $t('auth.signUpTitle')
      }}</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
  errorMessage: { type: String, default: '' },
  verifiedMessage: { type: String, default: '' },
  inPanel: { type: Boolean, default: false },
})

const { t } = useI18n()

const emit = defineEmits(['submit-login', 'submit-forgot'])

const form = ref({ email: '', password: '' })
const forgotEmail = ref('')
const showForgot = ref(false)

function handleLogin() {
  emit('submit-login', { email: form.value.email, password: form.value.password })
}

function handleForgot() {
  emit('submit-forgot', forgotEmail.value)
}
</script>
