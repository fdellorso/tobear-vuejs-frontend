<template>
  <div class="mx-auto max-w-max rounded-full border-2 shadow-xl overflow-hidden border-amber-900">
    <img :class="customClass" class="w-auto" src="/img/icons/icon-128x128.png" alt="toBear" />
  </div>
</template>

<script setup>
defineProps({
  customClass: {
    type: String,
    default: '',
  },
})
</script>

<style scoped></style>
