import { computed } from 'vue'

export function useAuthEnabled() {
  const authEnabled = computed(() => import.meta.env.VITE_AUTH_ENABLED !== 'false')
  return { authEnabled }
}
