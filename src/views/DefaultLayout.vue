<script setup>
import NavBarElement from '@/components/tailwindplus/NavBarElement.vue'
</script>

<template>
  <header>
    <NavBarElement></NavBarElement>
  </header>
  <main>
    <RouterView />
  </main>
  <footer></footer>
</template>

<style scoped></style>
