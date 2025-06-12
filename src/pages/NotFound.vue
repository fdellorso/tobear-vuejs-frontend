<script setup>
// No additional script needed for static 404 page
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h1 class="mt-6 text-4xl font-extrabold text-gray-900">404 - Page Not Found</h1>
      <p class="mt-2 text-gray-600">Oops! The page you're looking for doesn't exist.</p>
      <div class="mt-6">
        <router-link
          to="/"
          class="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
        >
          Go Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional additional styling */
</style>
