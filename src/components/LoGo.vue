<script setup></script>

<template>
  <div class="fixed top-5 left-5 z-40 overflow-hidden">
    <div>
      <RouterLink :key="'Home'" :to="{ name: 'Home' }">
        <img class="size-30" src="../assets/tobear.png" alt="logo" />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped></style>
