<script setup>
import LoGo from './LoGo.vue';
import ProfileIcon from './ProfileIcon.vue';

</script>

<template>
  <div class="fixed h-10 z-40 overflow-hidden">
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
  </div>
</template>

<style scoped></style>
