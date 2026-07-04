<template>
  <div v-if="user" class="mx-auto max-w-2xl px-4 py-8">
    <!-- Info utente -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-tb-text">{{ user.name }}</h2>
      <p class="text-sm text-tb-text-muted">{{ user.email }}</p>
    </div>

    <!-- Statistiche -->
    <div v-if="tasksLoading" class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div v-for="n in 6" :key="n" class="rounded-xl border border-tb-border bg-tb-surface p-4">
        <div class="h-3 w-16 animate-pulse rounded bg-tb-nav-active mb-3"></div>
        <div class="h-8 w-10 animate-pulse rounded bg-tb-nav-active"></div>
      </div>
    </div>

    <div v-else-if="tasksError" class="text-center text-sm text-tb-danger">
      {{ tasksError }}
    </div>

    <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div class="rounded-xl border border-tb-border bg-tb-surface p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-tb-text-muted">
          {{ $t('profile.total') }}
        </p>
        <p class="mt-2 text-3xl font-semibold text-tb-text">{{ taskCount }}</p>
      </div>
      <div class="rounded-xl border border-tb-border bg-tb-surface p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-tb-text-muted">
          {{ $t('profile.active') }}
        </p>
        <p class="mt-2 text-3xl font-semibold text-tb-text">{{ activeCount }}</p>
      </div>
      <div class="rounded-xl border border-tb-border bg-tb-surface p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-tb-text-muted">
          {{ $t('profile.completed') }}
        </p>
        <p class="mt-2 text-3xl font-semibold text-tb-success">{{ completedCount }}</p>
      </div>
      <div class="rounded-xl border border-tb-border bg-tb-surface p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-tb-text-muted">
          {{ $t('profile.thisWeek') }}
        </p>
        <p class="mt-2 text-3xl font-semibold text-tb-text">{{ thisWeekCount }}</p>
      </div>
      <div class="rounded-xl border border-tb-border bg-tb-surface p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-tb-text-muted">
          {{ $t('profile.completedThisWeek') }}
        </p>
        <p class="mt-2 text-3xl font-semibold text-tb-success">{{ completedThisWeekCount }}</p>
      </div>
      <div class="rounded-xl border border-tb-border bg-tb-surface p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-tb-text-muted">
          {{ $t('profile.completionRate') }}
        </p>
        <p class="mt-2 text-3xl font-semibold text-tb-accent">{{ completionRate }}%</p>
      </div>
    </div>
  </div>

  <div v-else class="mx-auto max-w-2xl px-4 py-8 text-center">
    <p class="text-sm text-tb-text-muted">{{ $t('auth.notLoggedInProfile') }}</p>
  </div>
</template>

<script setup>
import useUserStore from '@/stores/user.js'
import { computed, onMounted } from 'vue'
import { useTaskStats } from '@/composables/useTaskStats'

const userStore = useUserStore()
const user = computed(() => userStore.user)

const {
  taskCount,
  completedCount,
  activeCount,
  thisWeekCount,
  completedThisWeekCount,
  completionRate,
  loading: tasksLoading,
  error: tasksError,
  fetchStats,
} = useTaskStats()

onMounted(fetchStats)
</script>
