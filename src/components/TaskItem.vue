<script setup></script>

<template>
  <div class="relative overflow-hidden min-h-12 rounded-lg shadow-md">
    <i class="absolute z-1 w-2/2 min-h-12 left-0 px-3 bg-gray-100 hover:bg-yellow-700/30 font-bold content-center" aria-hidden="true"><slot></slot></i>
    <span class="absolute w-1/2 min-h-12 left-0 px-3 bg-green-500 content-center text-start">Completed</span>
    <span class="absolute w-1/2 min-h-12 right-0 px-3 bg-red-500 content-center text-end">Delete</span>
  </div>
</template>

<style scoped>
</style>
