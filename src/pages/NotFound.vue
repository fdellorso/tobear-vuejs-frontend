<template>
  <NotFoundPage :navigationRoutes="navigationRoutes"></NotFoundPage>
</template>

<script setup>
import NotFoundPage from '@/components/tailwindplus/NotFoundPage.vue'
import { flatRoutes } from '@/router'

const navigationRoutes = {
  home: flatRoutes.find((route) => route.name === 'Home')?.path,
  contact: flatRoutes.find((route) => route.name === 'Contact')?.path,
}
</script>

<style scoped></style>
