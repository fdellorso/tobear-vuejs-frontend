import { ref } from 'vue'
import { axiosClient } from '@/axios'
import useUserStore from '@/stores/user.js'

export function useTaskStats() {
  const userStore = useUserStore()
  const taskCount = ref(0)
  const completedCount = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const fetchStats = async () => {
    if (userStore.mode !== 'authenticated') {
      taskCount.value = 0
      completedCount.value = 0
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await axiosClient.get('/v1/tasks')
      if (Array.isArray(response.data.data)) {
        const allTasks = response.data.data
        taskCount.value = allTasks.length
        completedCount.value = allTasks.filter((t) => t.completed).length
      } else {
        taskCount.value = 0
        completedCount.value = 0
      }
    } catch {
      error.value = 'Impossibile caricare le statistiche'
      taskCount.value = 0
      completedCount.value = 0
    } finally {
      loading.value = false
    }
  }

  return { taskCount, completedCount, loading, error, fetchStats }
}
