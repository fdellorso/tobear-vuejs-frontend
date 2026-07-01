<template>
  <header v-if="user">
    <StackedLayout
      :navigation="navigation"
      :userNavigation="userNavigation"
      :user="userProfile"
      @submitLogout="submitLogout"
    >
      <template v-slot:logo>
        <LogoIcon customClass="size-8" />
      </template>
      <template v-slot:profile>
        <UserAvatar :name="user.name" :size="35" />
      </template>
    </StackedLayout>
  </header>
  <main>
    <RouterView />
  </main>
  <footer></footer>
</template>

<script setup>
import LogoIcon from '@/components/LogoIcon.vue'
import StackedLayout from '@/components/tailwindplus/StackedLayout.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import useUserStore from '@/stores/user.js'
import { router, flatRoutes } from '@/router'
import { axiosClient } from '@/axios'
import { computed } from 'vue'

const userStore = useUserStore()
const user = computed(() => userStore.user)

const navigation = flatRoutes
  .filter(
    (route) => (route.meta?.requiresAuth || route.meta?.requiresAccount) && route.meta?.showInNav,
  )
  .map((route) => ({ name: route.name, href: route.path }))

const userNavigation = [
  {
    name: 'Todo',
    href: '/todo',
  },
  {
    name: 'Your Profile',
    href: flatRoutes.find((route) => route.name === 'User')?.path,
  },
  {
    name: 'Settings',
    href: flatRoutes.find((route) => route.name === 'Setting')?.path,
  },
]

const userProfile = computed(() => ({
  name: user.value?.name ?? 'Utente',
  email: user.value?.email ?? '',
}))

function submitLogout() {
  axiosClient.post('/logout').then(() => {
    userStore.resetUser()
    router.push({ name: 'Home' })
  })
}
</script>

<style scoped></style>
