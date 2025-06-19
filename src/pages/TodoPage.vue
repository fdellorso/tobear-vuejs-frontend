<template>
  <div class="mx-auto max-w-2xl px-4 py-4">
    <div v-if="loading">
      <SkeletonTask v-for="n in 5" :key="n" class="mb-2" />
    </div>
    <div v-else>
      <div v-if="tasks.length === 0" class="text-gray-500">Nessun task trovato.</div>
      <draggable
        class="space-y-2 list-group list-none"
        :component="'transition-group'"
        :component-data="{ name: 'flip-list', tag: 'ul' }"
        v-model="tasks"
        v-bind="dragOptions"
        @start="drag = true"
        @end="
          () => {
            drag = false
            reorderTasks()
          }
        "
        item-key="id"
      >
        <template #item="{ element }">
          <li class="list-group-item bg-gray-100 rounded-lg shadow-md p-3 hover:bg-yellow-600/30">
            <i class="font-bold" aria-hidden="true">{{ element.title }}</i>
          </li>
        </template>
      </draggable>
    </div>

    <div class="py-2">
      <!-- <form @submit.prevent="createTask" class="mb-6"> -->
      <form>
        <div class="flex flex-col">
          <input
            v-model="form.title"
            type="text"
            name="newtask"
            id="newtask"
            placeholder="Titolo del task"
            @blur="createTask"
            class="border border-gray-300 rounded-lg shadow-md p-3"
            required
          />
          <!-- <textarea
            v-model="form.description"
            placeholder="Descrizione (opzionale)"
            class="border border-gray-300 rounded-lg shadow-md px-4 py-2"
          ></textarea>
          <button
            type="submit"
            class="bg-yellow-800 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            Aggiungi Task
          </button> -->
        </div>
      </form>
    </div>
    <div>
      <TaskItem>Task item</TaskItem>
    </div>
  </div>
</template>

<script setup>
import { axiosClient } from '@/axios'
import { ref, onMounted, computed } from 'vue'
import draggable from 'vuedraggable'

import SkeletonTask from '@/components/SkeletonTask.vue'
import TaskItem from '@/components/TaskItem.vue'
import { useTaskDB } from '@/idb/useTaskDB'

const tasks = ref([])
const form = ref({
  title: '',
  description: '',
})
const drag = ref(false)
const loading = ref(true)
const { getAllTasks, saveTask, saveTasks, clearTasks } = useTaskDB()

// const fetchTasks = async () => {
//   axiosClient
//     .get('/v1/tasks')
//     .then((response) => {
//       // tasks.value = response.data.data

//       if (Array.isArray(response.data.data)) {
//         tasks.value = response.data.data
//       } else {
//         console.warn('Dati ricevuti in formato inatteso:', response.data)
//       }
//     })
//     .catch((error) => {
//       console.error('Errore nel caricamento dei task:', error)
//     })
//     .finally(() => {
//       loading.value = false
//     })
// }

const fetchTasks = async () => {
  loading.value = true
  try {
    const response = await axiosClient.get('/v1/tasks')
    if (Array.isArray(response.data.data)) {
      tasks.value = response.data.data
      await clearTasks()
      await saveTasks(response.data.data)
    } else {
      console.warn('Formato inatteso:', response.data)
    }
  } catch (error) {
    console.warn('Errore fetching da rete, carico da IndexedDB', error.message)
    tasks.value = await getAllTasks()
  } finally {
    loading.value = false
  }
}

// const createTask = async () => {
//   const formData = new FormData()
//   formData.append('title', form.value.title)
//   formData.append('description', form.value.description)

//   axiosClient.post('/v1/tasks', formData).then(async (response) => {
//     const data = await response.data

//     // Se il backend ha risposto con 201 o 200
//     if (response.status === 201 || response.status === 200) {
//       form.value.title = ''
//       form.value.description = ''
//       await fetchTasks()
//     } else {
//       console.error('Errore nella risposta:', data)
//     }
//   })
// }

const createTask = async () => {
  if (!form.value.title.trim()) return

  const formData = new FormData()
  formData.append('title', form.value.title)
  formData.append('description', form.value.description || '')

  try {
    const response = await axiosClient.post('/v1/tasks', formData)
    if (response.status === 201 || response.status === 200) {
      const createdTask = response.data.data
      await saveTask(createdTask)
      form.value.title = ''
      form.value.description = ''
      await fetchTasks()
    }
  } catch (error) {
    console.warn('Errore fetching da rete, creo task in IndexedDB', error.message)
    // Offline: creo task locale con id unico timestamp e flag localOnly
    const localTask = {
      id: `local-${Date.now()}`,
      title: form.value.title,
      description: form.value.description || '',
      localOnly: true,
    }
    await saveTask(localTask)
    form.value.title = ''
    form.value.description = ''
    tasks.value.push(localTask)
  }
}

// const reorderTasks = async () => {
//   const ids = tasks.value.map((task) => task.id)
//   try {
//     await axiosClient.patch('/v1/tasks/reorder', {
//       tasks: ids,
//     })
//     console.log('Ordine aggiornato con successo.')
//   } catch (error) {
//     console.error('Errore durante il riordinamento:', error.response?.data || error)
//   }
// }

const reorderTasks = async () => {
  const ids = tasks.value.map((task) => task.id)
  try {
    await axiosClient.patch('/v1/tasks/reorder', { tasks: ids })
    await saveTasks(tasks.value)
    console.log('Ordine aggiornato con successo.')
  } catch (error) {
    console.error('Errore durante il riordinamento:', error.response?.data || error)
  }
}

const dragOptions = computed(() => ({
  animation: 200,
  group: 'description',
  disabled: false,
  ghostClass: 'ghost',
}))

const syncLocalTasks = async () => {
  const allTasks = await getAllTasks()
  const localTasks = allTasks.filter((t) => t.localOnly)

  for (const task of localTasks) {
    try {
      const formData = new FormData()
      formData.append('title', task.title)
      formData.append('description', task.description || '')
      const response = await axiosClient.post('/v1/tasks', formData)
      if (response.status === 201 || response.status === 200) {
        await clearTasks()
        await fetchTasks()
        console.log('Sincronizzazione task locali completata')
      }
    } catch (error) {
      console.error('Errore sincronizzazione task locale:', error)
    }
  }
}

// onMounted(fetchTasks)
onMounted(() => {
  fetchTasks()
  window.addEventListener('online', () => {
    console.log('Torni online, sincronizzo task locali...')
    syncLocalTasks()
  })
})
</script>

<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}

.ghost {
  opacity: 0.9;
  background: #8b5e3c;
}
</style>
