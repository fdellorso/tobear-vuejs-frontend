<template>
  <div class="mx-auto max-w-md px-4 py-8 min-h-screen">
    <h2 class="mb-6 text-xl font-semibold text-tb-text">Create account</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="reg-name" class="block text-sm font-medium text-tb-text-sec">Full name</label>
        <input
          id="reg-name"
          v-model="form.name"
          type="text"
          autocomplete="name"
          required
          class="mt-1 block w-full rounded-lg border border-tb-border bg-tb-surface px-3 py-2 text-sm text-tb-text placeholder:text-tb-text-muted focus:border-tb-accent focus:outline-none"
        />
        <p v-if="errors.name" class="mt-1 text-xs text-tb-danger">{{ errors.name[0] }}</p>
      </div>
      <div>
        <label for="reg-email" class="block text-sm font-medium text-tb-text-sec">Email</label>
        <input
          id="reg-email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          required
          class="mt-1 block w-full rounded-lg border border-tb-border bg-tb-surface px-3 py-2 text-sm text-tb-text placeholder:text-tb-text-muted focus:border-tb-accent focus:outline-none"
        />
        <p v-if="errors.email" class="mt-1 text-xs text-tb-danger">{{ errors.email[0] }}</p>
      </div>
      <div>
        <label for="reg-password" class="block text-sm font-medium text-tb-text-sec"
          >Password</label
        >
        <input
          id="reg-password"
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          required
          class="mt-1 block w-full rounded-lg border border-tb-border bg-tb-surface px-3 py-2 text-sm text-tb-text placeholder:text-tb-text-muted focus:border-tb-accent focus:outline-none"
        />
        <p v-if="errors.password" class="mt-1 text-xs text-tb-danger">{{ errors.password[0] }}</p>
      </div>
      <div>
        <label for="reg-confirm" class="block text-sm font-medium text-tb-text-sec"
          >Confirm password</label
        >
        <input
          id="reg-confirm"
          v-model="form.password_confirmation"
          type="password"
          autocomplete="new-password"
          required
          class="mt-1 block w-full rounded-lg border border-tb-border bg-tb-surface px-3 py-2 text-sm text-tb-text placeholder:text-tb-text-muted focus:border-tb-accent focus:outline-none"
        />
      </div>
      <button
        type="submit"
        class="w-full rounded-lg bg-tb-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
      >
        Create account
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-tb-text-muted">
      Already have an account?
      <RouterLink to="/login" class="font-medium text-tb-accent hover:opacity-80"
        >Sign in</RouterLink
      >
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit-register'])

const form = ref({ name: '', email: '', password: '', password_confirmation: '' })
const errors = ref({ name: [], email: [], password: [] })

defineExpose({
  setErrors: (e) => {
    errors.value = e
  },
})

function handleSubmit() {
  errors.value = { name: [], email: [], password: [] }
  emit('submit-register', { ...form.value })
}
</script>
