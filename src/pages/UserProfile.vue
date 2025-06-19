<template>
  <div class="mx-auto max-w-2xl px-4 py-4">
    <DescriptionList>
      <template v-slot:fullname>{{ user.name }}</template>
      <template v-slot:email>{{ user.email }}</template>
      <template v-slot:createddesc>Data of user creation</template>
      <template v-slot:created>{{ user.created_at }}</template>
    </DescriptionList>
  </div>
  <StatsSection :stats="stats"></StatsSection>
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

const fetchTasks = async () => {
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
    })
}

const stats = [
  { id: 1, name: 'Count of task created', value: taskCount },
  // { id: 2, name: 'Assets under holding', value: '$119 trillion' },
  // { id: 3, name: 'New users annually', value: '46,000' },
]

onMounted(fetchTasks)
</script>

<style scoped></style>
