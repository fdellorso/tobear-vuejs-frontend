<script setup>
import { computed } from 'vue'
import * as Icons from '@heroicons/vue/24/outline'

const props = defineProps({
  name: String,
  class: {
    type: String,
    default: 'h-6 w-6',
  },
})

const IconComponent = computed(() => {
  return Icons[`${props.name}Icon`]
})
</script>

<template>
  <component :is="IconComponent" :class="props.class" />
</template>
