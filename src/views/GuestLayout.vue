<template>
  <HeaderElement
    class="relative z-40"
    :navigation="navigation"
    :navigationRoutes="navigationRoutes"
  >
    <template v-slot:logo>
      <LogoIcon customClass="size-8" />
    </template>
  </HeaderElement>
  <main><RouterView /></main>
  <footer></footer>
</template>

<script setup>
import LogoIcon from '@/components/LogoIcon.vue'
import HeaderElement from '@/components/tailwindplus/HeaderElement.vue'
import { flatRoutes } from '@/router'

const navigation = flatRoutes
  .filter((route) => !route.meta?.requiresAuth && route.meta?.showInNav)
  .map((route) => ({ name: route.name, href: route.path }))

const navigationRoutes = {
  home: flatRoutes.find((route) => route.name === 'Home')?.path,
  login: flatRoutes.find((route) => route.name === 'Login')?.path,
  about: flatRoutes.find((route) => route.name === 'About')?.path,
  premium: flatRoutes.find((route) => route.name === 'Premium')?.path,
}
</script>

<style scoped></style>
