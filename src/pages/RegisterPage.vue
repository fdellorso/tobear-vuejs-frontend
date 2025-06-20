<script setup>
import { axiosClient, withCSRF } from '@/axios'
import { router } from '@/router'
import useUserStore from '@/stores/user.js'
import { ref } from 'vue'

const data = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const errorMessage = ref({
  name: [],
  email: [],
  password: [],
})

const userStore = useUserStore()

function submit() {
  // axiosCSRF.get('/sanctum/csrf-cookie').then(() => {
  withCSRF(() =>
    axiosClient
      .post('/register', data.value)
      .then(() => {
        userStore.resetUser()
        router.push({ name: 'EmailVerification' })
      })
      .catch((error) => {
        console.log(error)
        errorMessage.value = error.response?.data?.errors || 'An error occurred'
      }),
  )
  // })
}
</script>

<template>
  <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
    Create new account
  </h2>

  <div class="mt-10 px-5 sm:mx-auto sm:w-full sm:max-w-sm">
    <form @submit.prevent="submit" class="space-y-6">
      <div>
        <label for="name" class="block text-sm/6 font-medium text-gray-900">Full Name</label>
        <div class="mt-2">
          <input
            type="name"
            name="name"
            id="name"
            autocomplete="name"
            v-model="data.name"
            class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
        </div>
        <p class="text-sm mt-1 text-red-500">
          {{ errorMessage.name ? errorMessage.name[0] : '' }}
        </p>
      </div>

      <div>
        <label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
        <div class="mt-2">
          <input
            type="email"
            name="email"
            id="email"
            autocomplete="email"
            v-model="data.email"
            class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
        </div>
        <p class="text-sm mt-1 text-red-500">
          {{ errorMessage.email ? errorMessage.email[0] : '' }}
        </p>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>
        </div>
        <div class="mt-2">
          <input
            type="password"
            name="password"
            id="password"
            autocomplete="new-password"
            v-model="data.password"
            class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
        </div>
        <p class="text-sm mt-1 text-red-500">
          {{ errorMessage.password ? errorMessage.password[0] : '' }}
        </p>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <label for="passwordConfirmation" class="block text-sm/6 font-medium text-gray-900"
            >Repeat Password</label
          >
        </div>
        <div class="mt-2">
          <input
            type="password"
            name="password"
            id="passwordConfirmation"
            autocomplete="new-password"
            v-model="data.password_confirmation"
            class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          class="flex w-full justify-center rounded-md bg-blue-800 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Create new account
        </button>
      </div>
    </form>

    <p class="mt-10 text-center text-sm/6 text-gray-500">
      Already have an account?
      {{ ' ' }}
      <RouterLink :to="{ name: 'Login' }" class="font-semibold text-blue-800 hover:text-blue-700"
        >Login from here</RouterLink
      >
    </p>
  </div>
</template>

<style scoped></style>
