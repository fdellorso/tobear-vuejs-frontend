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
          <li class="list-group-item">
            <TaskItem
              :title="element.title"
              @complete="handleComplete(element)"
              @delete="handleDelete(element)"
              @horizontal-dragging="(v) => (isHorizontalDragging = v)"
            />
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
    <!-- <div>
      <TaskItem @complete="handleComplete" @delete="handleDelete">Task item</TaskItem>
    </div> -->
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
const isHorizontalDragging = ref(false)
const loading = ref(true)
const {
  getAllTasks,
  saveTask,
  saveTasks,
  clearTasks,
  deleteTask,
  savePendingReorder,
  getPendingReorder,
  clearPendingReorder,
} = useTaskDB()

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
      tasks.value = await getAllTasks()
    } else {
      console.warn('Formato inatteso:', response.data)
    }
  } catch (error) {
    console.warn('Errore fetching da rete, carico da IndexedDB', error.message)
    const allTasks = await getAllTasks()
    tasks.value = allTasks.filter((t) => !t.pendingDelete)
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
  try {
    // Aggiorna il campo order di ogni task in base alla nuova posizione nell'array
    tasks.value.forEach((task, index) => {
      task.order = index
    })

    // Prepara array di id per backend (in ordine corretto)
    const ids = tasks.value.map((task) => task.id)

    // Aggiorna backend con nuovo ordine
    await axiosClient.patch('/v1/tasks/reorder', { tasks: ids })

    // Clona i task con ordine aggiornato e salva su IndexedDB
    const plainTasks = tasks.value.map((task) => ({ ...task }))
    await saveTasks(plainTasks)
    tasks.value = await getAllTasks()

    await clearPendingReorder()
    console.log('Ordine aggiornato con successo.')
  } catch (error) {
    console.error(
      'Errore durante il riordinamento, salvo per sync offline:',
      error.response?.data || error.message,
    )

    // Salva ordine in IndexedDB anche se la rete fallisce
    const plainTasks = tasks.value.map((task) => ({ ...task }))
    await saveTasks(plainTasks)

    // Segnala riordino pendente per retry quando si torna online
    await savePendingReorder(tasks.value.map((t) => t.id))
  }
}

const handleComplete = async (task) => {
  task.completed = !task.completed
  task.pendingComplete = true
  await saveTask({ ...task })
  try {
    await axiosClient.patch(`/v1/tasks/${task.id}`, { completed: task.completed })
    task.pendingComplete = false
    await saveTask({ ...task })
  } catch (error) {
    console.warn('Offline: completamento salvato localmente', error.message)
  }
}

const handleDelete = async (task) => {
  const idx = tasks.value.findIndex((t) => t.id === task.id)
  if (idx > -1) tasks.value.splice(idx, 1)
  task.pendingDelete = true
  await saveTask({ ...task })
  try {
    await axiosClient.delete(`/v1/tasks/${task.id}`)
    await deleteTask(task.id)
  } catch (error) {
    console.warn('Offline: eliminazione salvata per sync', error.message)
  }
}

const dragOptions = computed(() => ({
  animation: 200,
  group: 'description',
  disabled: false,
  ghostClass: 'ghost',
  move: () => !isHorizontalDragging.value, // 👈 impedisce il drag verticale
}))

const syncLocalTasks = async () => {
  const allTasks = await getAllTasks()

  // Sincronizza eliminazioni in sospeso
  for (const task of allTasks.filter((t) => t.pendingDelete)) {
    try {
      await axiosClient.delete(`/v1/tasks/${task.id}`)
      await deleteTask(task.id)
      console.log('Eliminazione offline sincronizzata:', task.id)
    } catch (error) {
      console.error('Errore sync eliminazione:', error)
    }
  }

  // Sincronizza completamenti in sospeso
  for (const task of allTasks.filter((t) => t.pendingComplete)) {
    try {
      await axiosClient.patch(`/v1/tasks/${task.id}`, { completed: task.completed })
      task.pendingComplete = false
      await saveTask(task)
      console.log('Completamento offline sincronizzato:', task.id)
    } catch (error) {
      console.error('Errore sync completamento:', error)
    }
  }

  // Sincronizza creazioni in sospeso (pattern esistente)
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

onMounted(async () => {
  await syncLocalTasks()

  // Sincronizza riordino pendente prima di fetchTasks (evita che clearTasks lo cancelli)
  const pendingIds = await getPendingReorder()
  if (pendingIds) {
    try {
      await axiosClient.patch('/v1/tasks/reorder', { tasks: pendingIds })
      await clearPendingReorder()
      console.log('Riordino pendente sincronizzato')
    } catch (e) {
      console.warn('Riordino pendente non sincronizzato (offline):', e.message)
    }
  }

  await fetchTasks()

  window.addEventListener('online', () => {
    console.log('Torni online, sincronizzo...')
    syncLocalTasks()

    getPendingReorder().then((pendingIds) => {
      if (pendingIds) {
        axiosClient
          .patch('/v1/tasks/reorder', { tasks: pendingIds })
          .then(async () => {
            await clearPendingReorder()
            console.log('Riordino offline sincronizzato con successo')
          })
          .catch((e) => {
            console.error('Errore sync riordino:', e.message)
          })
      }
    })
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
