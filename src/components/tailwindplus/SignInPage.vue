<template>
  <!--
    This example requires updating your template:

    ```
    <html class="h-full bg-white">
    <body class="h-full">
    ```
  -->
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <slot name="logo"
        ><img
          class="mx-auto h-10 w-auto"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
      /></slot>
      <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
        Sign in to your account
      </h2>
    </div>
    <slot name="message"></slot>
    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <div v-if="forgotMode" class="mt-4 bg-white p-6 rounded shadow">
        <form @submit.prevent="submitForgot" class="space-y-6">
          <div>
            <label for="email" class="block text-sm/6 font-medium text-gray-900"
              >Reset your password</label
            >
            <div class="mt-2">
              <input
                type="email"
                name="email"
                id="email"
                autocomplete="email"
                required=""
                placeholder="Enter your email"
                v-model="forgotEmail.email"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Send Reset Link
            </button>
          </div>
          <div>
            <button @click="forgotMode = false" class="mt-3 text-sm text-gray-600 hover:underline">
              ← Back to Login
            </button>
          </div>
        </form>
      </div>
      <div v-else class="mt-4 bg-white p-6 rounded shadow">
        <form @submit.prevent="submitLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm/6 font-medium text-gray-900"
              >Email address</label
            >
            <div class="mt-2">
              <input
                type="email"
                name="email"
                id="email"
                autocomplete="email"
                required=""
                v-model="formData.email"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm/6 font-medium text-gray-900"
                >Password</label
              >
              <div class="text-sm">
                <button
                  type="button"
                  @click="forgotMode = true"
                  class="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </button>
              </div>
            </div>
            <div class="mt-2">
              <input
                type="password"
                name="password"
                id="password"
                autocomplete="current-password"
                required=""
                v-model="formData.password"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
      <p class="mt-10 text-center text-sm/6 text-gray-500">
        Not a member?
        {{ ' ' }}
        <RouterLink
          :to="navigationRoutes.register"
          class="font-semibold text-indigo-600 hover:text-indigo-500"
          >Create an account</RouterLink
        >
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

defineProps({
  navigationRoutes: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['submitLogin', 'submitForgot'])

const formData = reactive({
  email: '',
  password: '',
})

const forgotEmail = reactive({
  email: '',
})

function submitLogin() {
  emit('submitLogin', { ...formData })
}

function submitForgot() {
  emit('submitForgot', { ...forgotEmail })
}

const forgotMode = ref(false)
</script>

<style scoped></style>
