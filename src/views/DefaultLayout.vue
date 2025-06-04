<script setup>
import LoGo from '@/components/LoGo.vue'
import ProfileIcon from '@/components/ProfileIcon.vue'
</script>

<template>
  <LoGo />
  <div
    v-if="
      $route.name !== 'Login' &&
      $route.name !== 'Register' &&
      $route.name !== 'ResetPassword' &&
      $route.name !== 'VerifyEmail'
    "
  >
    <ProfileIcon />
  </div>
  <RouterView />
</template>

<style scoped></style>
