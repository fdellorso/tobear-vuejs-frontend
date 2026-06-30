<template>
  <div v-if="user" class="mx-auto max-w-2xl px-4 py-4">
    <DescriptionList>
      <template v-slot:fullname>{{ user.name }}</template>
      <template v-slot:email>{{ user.email }}</template>
      <template v-slot:createddesc>Data of user creation</template>
      <template v-slot:created>{{ user.created_at }}</template>
    </DescriptionList>

    <div v-if="tasksLoading" class="bg-white py-24 sm:py-32">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto flex max-w-xs flex-col gap-y-4 text-center">
          <div class="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
          <div class="h-10 w-16 bg-gray-200 rounded animate-pulse mx-auto sm:h-14"></div>
        </div>
      </div>
    </div>

    <div v-else-if="tasksError" class="bg-white py-24 sm:py-32">
      <div class="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <p class="text-sm text-red-500">{{ tasksError }}</p>
      </div>
    </div>

    <StatsSection v-else :stats="stats" />
  </div>

  <div v-else class="mx-auto max-w-2xl px-4 py-4 text-center">
    <p class="text-sm text-gray-500">Devi aver effettuato l'accesso per vedere il profilo.</p>
  </div>
</template>

<script setup>
import DescriptionList from '@/components/tailwindplus/DescriptionList.vue'
import StatsSection from '@/components/tailwindplus/StatsSection.vue'
import useUserStore from '@/stores/user.js'
import { computed, onMounted } from 'vue'
import { useTaskStats } from '@/composables/useTaskStats'

const userStore = useUserStore()
const user = computed(() => userStore.user)

const { taskCount, loading: tasksLoading, error: tasksError, fetchStats } = useTaskStats()

const stats = [{ id: 1, name: 'Count of task created', value: taskCount }]

onMounted(fetchStats)
</script>

<style scoped></style>
