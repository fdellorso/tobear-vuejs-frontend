<template>
  <header>
    <!-- <NavBarElement
      :navigation="navigation"
      :navigationRoutes="navigationRoutes"
      @submitLogout="submitLogout"
    >
      <template v-slot:logo>
        <LogoIcon customClass="size-8" />
      </template>
      <template v-slot:profile>
        <UserAvatar :name="user.name" :size="35" />
      </template>
    </NavBarElement> -->
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
// import NavBarElement from '@/components/tailwindplus/NavBarElement.vue'
import StackedLayout from '@/components/tailwindplus/StackedLayout.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import useUserStore from '@/stores/user.js'
import { router, flatRoutes } from '@/router'
import { axiosClient } from '@/axios'

const userStore = useUserStore()
const user = userStore.user

const navigation = flatRoutes
  .filter((route) => route.meta?.requiresAuth && route.meta?.showInNav)
  .map((route) => ({ name: route.name, href: route.path }))

const userNavigation = [
  {
    name: 'Your Profile',
    href: flatRoutes.find((route) => route.name === 'User')?.path,
  },
  {
    name: 'Settings',
    href: flatRoutes.find((route) => route.name === 'Setting')?.path,
  },
  // {
  //   name: 'Sign out',
  //   href: flatRoutes.find((route) => route.name === 'Setting')?.path,
  // },
]

const userProfile = {
  name: user.name,
  email: user.email,
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}

function submitLogout() {
  axiosClient.post('/logout').then(() => {
    userStore.resetUser()
    router.push({ name: 'Home' })
  })
}
</script>

<style scoped></style>
