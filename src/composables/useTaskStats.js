import { ref } from 'vue'
import { axiosClient } from '@/axios'
import useUserStore from '@/stores/user.js'

export function useTaskStats() {
  const userStore = useUserStore()
  const taskCount = ref(0)
  const completedCount = ref(0)
  const activeCount = ref(0)
  const thisWeekCount = ref(0)
  const completedThisWeekCount = ref(0)
  const completionRate = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const fetchStats = async () => {
    if (userStore.mode !== 'authenticated') {
      taskCount.value = 0
      completedCount.value = 0
      activeCount.value = 0
      thisWeekCount.value = 0
      completedThisWeekCount.value = 0
      completionRate.value = 0
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await axiosClient.get('/v1/stats')
      const data = response.data
      taskCount.value = data.total ?? 0
      completedCount.value = data.completed ?? 0
      activeCount.value = data.active ?? 0
      thisWeekCount.value = data.this_week ?? 0
      completedThisWeekCount.value = data.completed_this_week ?? 0
      completionRate.value = data.completion_rate ?? 0
    } catch {
      error.value = 'Impossibile caricare le statistiche'
      taskCount.value = 0
      completedCount.value = 0
      activeCount.value = 0
      thisWeekCount.value = 0
      completedThisWeekCount.value = 0
      completionRate.value = 0
    } finally {
      loading.value = false
    }
  }

  return {
    taskCount,
    completedCount,
    activeCount,
    thisWeekCount,
    completedThisWeekCount,
    completionRate,
    loading,
    error,
    fetchStats,
  }
}
