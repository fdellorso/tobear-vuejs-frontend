<template>
  <div class="mx-auto max-w-2xl px-4 py-4">
    <DescriptionList>
      <template v-slot:fullname>{{ user.name }}</template>
      <template v-slot:email>{{ user.email }}</template>
      <template v-slot:createddesc>Data of user creation</template>
      <template v-slot:created>{{ user.created_at }}</template>
    </DescriptionList>
  </div>

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
</template>

<script setup>
import DescriptionList from '@/components/tailwindplus/DescriptionList.vue'
import StatsSection from '@/components/tailwindplus/StatsSection.vue'
import useUserStore from '@/stores/user.js'
import { axiosClient } from '@/axios'
import { ref, onMounted } from 'vue'

const userStore = useUserStore()
const user = userStore.user

const taskCount = ref(0)
const tasksLoading = ref(false)
const tasksError = ref(null)

const fetchTasks = async () => {
  tasksLoading.value = true
  tasksError.value = null
  axiosClient
    .get('/v1/tasks')
    .then((response) => {
      if (Array.isArray(response.data.data)) {
        taskCount.value = response.data.data.length
      } else {
        console.warn('Dati ricevuti in formato inatteso:', response.data)
        taskCount.value = 0
      }
    })
    .catch((error) => {
      console.error('Errore nel caricamento dei task:', error)
      taskCount.value = 0
      tasksError.value = 'Impossibile caricare il conteggio dei task'
    })
    .finally(() => {
      tasksLoading.value = false
    })
}

const stats = [{ id: 1, name: 'Count of task created', value: taskCount }]

onMounted(fetchTasks)
</script>

<style scoped></style>
