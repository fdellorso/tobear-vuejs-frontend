<template>
  <RegisterContent ref="registerContent" @submit-register="submit" />
</template>

<script setup>
import { axiosClient, withCSRF } from '@/axios'
import { router } from '@/router'
import useUserStore from '@/stores/user.js'
import { ref } from 'vue'
import RegisterContent from '@/components/RegisterContent.vue'

const registerContent = ref(null)
const userStore = useUserStore()

function submit(data) {
  withCSRF(() =>
    axiosClient
      .post('/register', data)
      .then(() => {
        userStore.resetUser()
        router.push({ name: 'VerifyEmail' })
      })
      .catch((error) => {
        const errors = error.response?.data?.errors || {}
        registerContent.value?.setErrors(errors)
      }),
  )
}
</script>
