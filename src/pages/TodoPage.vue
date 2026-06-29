<template>
  <div class="mx-auto max-w-2xl px-4 py-4">
    <div v-if="loading">
      <SkeletonTask v-for="n in 5" :key="n" class="mb-2" />
    </div>
    <div v-else>
      <div
        v-if="mode === 'guest'"
        class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600"
      >
        Usi toBear in modalità locale.
        <RouterLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500"
          >Accedi</RouterLink
        >
        o
        <RouterLink to="/register" class="font-medium text-indigo-600 hover:text-indigo-500"
          >Registrati</RouterLink
        >
        per sincronizzare i tuoi task tra dispositivi.
      </div>
      <div v-if="tasks.length === 0" class="text-gray-500">Nessun task trovato.</div>

      <draggable
        class="space-y-2 list-group list-none"
        :component="'transition-group'"
        :component-data="{ name: 'flip-list', tag: 'ul' }"
        v-model="activeTasks"
        v-bind="dragOptions"
        @start="drag = true"
        @end="onDragEnd"
        item-key="id"
      >
        <template #item="{ element }">
          <li class="list-group-item">
            <TaskItem
              :title="element.title"
              :drag-active="drag"
              @complete="handleComplete(element)"
              @delete="handleDelete(element)"
              @edit="handleEdit(element, $event)"
              @horizontal-dragging="(v) => (isHorizontalDragging = v)"
            />
          </li>
        </template>
      </draggable>

      <template v-if="completedTasks.length > 0">
        <div class="mt-6 mb-2 text-xs font-medium uppercase tracking-wider text-gray-400/60">
          Completati
        </div>
        <TransitionGroup name="completed" tag="ul" class="space-y-2">
          <li v-for="task in completedTasks" :key="task.id" class="opacity-60">
            <TaskItem
              :title="task.title"
              @complete="handleComplete(task)"
              @delete="handleDelete(task)"
              @edit="handleEdit(task, $event)"
              @horizontal-dragging="(v) => (isHorizontalDragging = v)"
            />
          </li>
        </TransitionGroup>
      </template>

      <div class="py-2">
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
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { axiosClient } from '@/axios'
import { ref, onMounted, computed } from 'vue'
import draggable from 'vuedraggable'
import useUserStore from '@/stores/user.js'

import SkeletonTask from '@/components/SkeletonTask.vue'
import TaskItem from '@/components/TaskItem.vue'
import { useTaskDB } from '@/idb/useTaskDB'
import { migrateGuestTasks } from '@/composables/useGuestMigration'

const userStore = useUserStore()
const mode = computed(() => userStore.mode)

const tasks = ref([])
const form = ref({
  title: '',
  description: '',
})
const drag = ref(false)
const isHorizontalDragging = ref(false)
const loading = ref(true)
const activeTasks = ref([])
const completedTasks = computed(() =>
  tasks.value.filter((t) => t.completed).sort((a, b) => a.order - b.order),
)

const rebuildActiveTasks = () => {
  activeTasks.value = tasks.value.filter((t) => !t.completed).sort((a, b) => a.order - b.order)
}
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
  if (userStore.mode === 'guest') {
    const allTasks = await getAllTasks()
    tasks.value = allTasks.filter((t) => !t.pendingDelete)
    rebuildActiveTasks()
    loading.value = false
    return
  }
  try {
    const response = await axiosClient.get('/v1/tasks')
    if (Array.isArray(response.data.data)) {
      tasks.value = response.data.data
      await clearTasks()
      await saveTasks(response.data.data)
      tasks.value = await getAllTasks()
      rebuildActiveTasks()
    } else {
      console.warn('Formato inatteso:', response.data)
    }
  } catch (error) {
    console.warn('Errore fetching da rete, carico da IndexedDB', error.message)
    const allTasks = await getAllTasks()
    tasks.value = allTasks.filter((t) => !t.pendingDelete)
    rebuildActiveTasks()
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

  if (userStore.mode === 'guest') {
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
    rebuildActiveTasks()
    return
  }

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
    rebuildActiveTasks()
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
  activeTasks.value.forEach((task, index) => {
    task.order = index
  })

  const completed = tasks.value.filter((t) => t.completed)
  tasks.value = [...activeTasks.value, ...completed]

  if (userStore.mode === 'guest') {
    const plainTasks = tasks.value.map((task) => ({ ...task }))
    await saveTasks(plainTasks)
    tasks.value = await getAllTasks()
    rebuildActiveTasks()
    return
  }

  try {
    const ids = tasks.value.map((task) => task.id)

    await axiosClient.patch('/v1/tasks/reorder', { tasks: ids })

    const plainTasks = tasks.value.map((task) => ({ ...task }))
    await saveTasks(plainTasks)
    tasks.value = await getAllTasks()
    rebuildActiveTasks()

    await clearPendingReorder()
    console.log('Ordine aggiornato con successo.')
  } catch (error) {
    console.error(
      'Errore durante il riordinamento, salvo per sync offline:',
      error.response?.data || error.message,
    )

    const plainTasks = tasks.value.map((task) => ({ ...task }))
    await saveTasks(plainTasks)

    await savePendingReorder(tasks.value.map((t) => t.id))
  }
}

const onDragEnd = () => {
  drag.value = false
  reorderTasks()
}

const handleComplete = async (task) => {
  navigator.vibrate?.(50)
  task.completed = !task.completed
  task.pendingComplete = true
  await saveTask({ ...task })
  rebuildActiveTasks()
  if (userStore.mode === 'guest') return
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
  rebuildActiveTasks()
  task.pendingDelete = true
  await saveTask({ ...task })
  if (userStore.mode === 'guest') return
  try {
    await axiosClient.delete(`/v1/tasks/${task.id}`)
    await deleteTask(task.id)
  } catch (error) {
    console.warn('Offline: eliminazione salvata per sync', error.message)
  }
}

const isDesktop =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

const handleEdit = async (task, newTitle) => {
  const original = tasks.value.find((t) => t.id === task.id)
  if (!original) return
  original.title = newTitle
  await saveTask({ ...original })

  if (userStore.mode === 'guest') return

  try {
    await axiosClient.patch(`/v1/tasks/${task.id}`, { title: newTitle })
  } catch (error) {
    console.warn('Offline: modifica titolo salvata localmente', error.message)
  }
}

const dragOptions = computed(() => ({
  animation: 200,
  group: 'description',
  disabled: false,
  ghostClass: 'ghost',
  delay: 500,
  delayOnTouchOnly: true,
  touchStartThreshold: 10,
  handle: isDesktop ? '.drag-handle' : undefined,
  move: () => !isHorizontalDragging.value,
}))

const syncLocalTasks = async () => {
  if (userStore.mode === 'guest') return
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
  if (userStore.mode !== 'guest') {
    await syncLocalTasks()
    await migrateGuestTasks()

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
  }

  await fetchTasks()

  if (userStore.mode !== 'guest') {
    window.addEventListener('online', () => {
      console.log('Torni online, sincronizzo...')
      syncLocalTasks()
      migrateGuestTasks()

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
  }
})
</script>

<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}
.flip-list-leave-active {
  position: absolute;
  transition: all 0.3s ease;
}
.flip-list-leave-to {
  opacity: 0;
  transform: translateX(80px);
}

.completed-move {
  transition: transform 0.4s ease;
}
.completed-enter-active {
  transition: all 0.4s ease 0.2s;
}
.completed-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}
.completed-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.completed-leave-to {
  opacity: 0;
  transform: translateX(80px);
}

.ghost {
  opacity: 0.9;
  background: #8b5e3c;
}
</style>
