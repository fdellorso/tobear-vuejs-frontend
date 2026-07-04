<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-6 text-center">
    <p class="text-6xl font-bold text-tb-accent">404</p>
    <h1 class="mt-4 text-2xl font-semibold text-tb-text">{{ $t('notFound.title') }}</h1>
    <p class="mt-2 text-sm text-tb-text-muted">
      {{ $t('notFound.message') }}
    </p>
    <RouterLink
      to="/todo"
      class="mt-8 rounded-lg bg-tb-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
    >
      {{ $t('notFound.back') }}
    </RouterLink>
  </div>
</template>

<script setup></script>
