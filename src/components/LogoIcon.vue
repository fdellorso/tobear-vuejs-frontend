<template>
  <div
    :class="
      noBorder
        ? 'mx-auto max-w-max rounded-full shadow-lg overflow-hidden'
        : 'mx-auto max-w-max rounded-full shadow-xl overflow-hidden border-2 border-amber-900'
    "
  >
    <img :class="customClass" class="w-auto" src="/img/icons/icon-128x128.png" alt="toBear" />
  </div>
</template>

<script setup>
defineProps({
  customClass: {
    type: String,
    default: '',
  },
  noBorder: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped></style>
