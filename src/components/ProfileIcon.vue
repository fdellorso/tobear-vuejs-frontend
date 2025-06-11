<script setup>
import { axiosClient } from '@/axios'
import router from '@/router'
import useUserStore from '@/stores/user.js'
import { computed } from 'vue'

import { UserIcon, Bars3Icon, ArrowLeftStartOnRectangleIcon } from '@heroicons/vue/24/solid'

const userStore = useUserStore()
const user = computed(() => userStore.user)

function logout() {
  axiosClient.post('/logout').then(() => {
    userStore.resetUser()
    router.push({ name: 'Home' })
  })
}
</script>

<template>
  <div class="fixed bottom-5 right-5 z-40 overflow-hidden p-3">
    <div v-if="user">
      <div
        class="border-2 shadow-md/50 border-green-800 bg-green-800 rounded-full hover:bg-green-700 hover:border-green-700"
      >
        <RouterLink :key="'Todo'" :to="{ name: 'Todo' }">
          <Bars3Icon class="size-10 text-gray-100 hover:text-gray-200" />
        </RouterLink>
      </div>
      <div
        class="border-2 shadow-md/50 border-green-800 bg-green-800 rounded-full hover:bg-green-700 hover:border-green-700"
      >
        <ArrowLeftStartOnRectangleIcon @click="logout" class="size-10 text-gray-100 hover:text-gray-200" />
      </div>
    </div>
    <div v-else>
      <div
        class="border-2 shadow-md/50 border-green-800 bg-green-800 rounded-full hover:bg-green-700 hover:border-green-700"
      >
        <RouterLink :key="'Login'" :to="{ name: 'Login' }" aria-label="Login">
          <UserIcon class="size-10 text-gray-100 hover:text-gray-200" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
