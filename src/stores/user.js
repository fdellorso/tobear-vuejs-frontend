import { axiosClient } from '@/axios'
import { defineStore } from 'pinia'

const MODE_KEY = 'tobear_mode'

const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isUserLoaded: false,
    mode: null, // 'guest' | 'authenticated' | null (indeterminato / primo avvio)
  }),
  getters: {
    isAuthenticated: (state) => state.mode === 'authenticated',
  },
  actions: {
    loadMode() {
      const saved = localStorage.getItem(MODE_KEY)
      if (saved === 'guest' || saved === 'authenticated') {
        this.mode = saved
      }
    },
    setMode(value) {
      this.mode = value
      if (value === null) {
        localStorage.removeItem(MODE_KEY)
      } else {
        localStorage.setItem(MODE_KEY, value)
      }
    },
    clearSession() {
      this.user = null
      this.isUserLoaded = false
    },
    fetchUser() {
      if (this.isUserLoaded) {
        return Promise.resolve(this.user)
      }

      return axiosClient
        .get('/user')
        .then(({ data }) => {
          this.user = data
          this.isUserLoaded = true
          this.setMode('authenticated')
          return data
        })
        .catch((error) => {
          this.user = null
          this.isUserLoaded = true
          throw error
        })
    },
    resetUser() {
      this.clearSession()
      this.setMode('guest')
    },
  },
})

export default useUserStore
