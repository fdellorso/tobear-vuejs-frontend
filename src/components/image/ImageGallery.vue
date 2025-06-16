<template>
  <header class="bg-white shadow-sm">
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900"><slot></slot></h1>
    </div>
  </header>
  <main>
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div
          v-for="image in images"
          :key="image.id"
          class="bg-white overflow-hidden shadow rounded-lg"
        >
          <img :src="image.path" alt="Image" class="w-full h-48 object-contain" />
          <div class="px-4 py-1">
            <h3 class="text-lg font-semibold text-gray-900">{{ image.name }}</h3>
            <p class="text-sm text-gray-500 mb-4">{{ image.label }}</p>
          </div>
          <div class="flex justify-between px-4 py-6 items-center mt-4">
            <button
              type="submit"
              @click="copyImageUrl(image.path)"
              class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Copy Image Url
            </button>
            <button
              type="submit"
              @click="deleteImage(image.id)"
              class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
defineProps({
  images: Array,
})

defineEmits(['copy', 'delete'])
</script>

<style scoped></style>
