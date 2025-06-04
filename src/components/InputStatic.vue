<script setup>
import { ref } from 'vue'

const value = ref('')
const locked = ref(false)

function lockInput() {
  if (value.value.trim() !== '') {
    locked.value = true
  }
}

function unlockInput() {
  locked.value = false
}
</script>

<template>
  <div>
    <input
      v-if="!locked"
      v-model="value"
      @blur="lockInput"
      class="border px-3 py-2 rounded-md outline-1 w-full transition-colors duration-300"
      :class="value ? 'bg-white' : 'bg-gray-100'"
      placeholder="Inserisci testo"
    />

    <div
      v-else
      @click="unlockInput"
      class="px-3 py-2 rounded-md outline-1 w-full bg-green-100 cursor-pointer border border-green-400 text-green-900"
    >
      {{ value }}
    </div>
  </div>
</template>

<script scoped></script>
