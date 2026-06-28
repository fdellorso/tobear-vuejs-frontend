import { axiosClient } from '@/axios'
import { useTaskDB } from '@/idb/useTaskDB'

export async function migrateGuestTasks() {
  const { getAllTasks, saveTask, deleteTask } = useTaskDB()

  const allTasks = await getAllTasks()
  const localTasks = allTasks.filter((t) => String(t.id).startsWith('local-'))
  if (localTasks.length === 0) return

  let remoteMaxOrder = 0
  try {
    const response = await axiosClient.get('/v1/tasks')
    if (Array.isArray(response.data.data)) {
      const orders = response.data.data.map((t) => t.order ?? 0)
      remoteMaxOrder = orders.length > 0 ? Math.max(...orders) : 0
    }
  } catch (error) {
    console.warn('Migrazione rimandata: impossibile caricare task remoti', error.message)
    return
  }

  const sorted = [...localTasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  for (let i = 0; i < sorted.length; i++) {
    const task = sorted[i]

    if (task.pendingDelete) {
      await deleteTask(task.id)
      continue
    }

    const payload = {
      title: task.title,
      description: task.description || '',
      completed: !!task.completed,
      order: remoteMaxOrder + i + 1,
    }

    try {
      const response = await axiosClient.post('/v1/tasks', payload)
      const createdTask = response.data?.data
      if (!createdTask || !createdTask.id) {
        console.warn('Migrazione: risposta inattesa per', task.id)
        break
      }
      await deleteTask(task.id)
      await saveTask(createdTask)
    } catch (error) {
      console.warn('Migrazione fallita per', task.id, error.message)
      break
    }
  }
}
