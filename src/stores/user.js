import { axiosClient } from '@/axios'
import { defineStore } from 'pinia'

const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isUserLoaded: false,
  }),
  actions: {
    fetchUser() {
      if (this.isUserLoaded) {
        return Promise.resolve(this.user)
      }

      return axiosClient
        .get('/user')
        .then(({ data }) => {
          this.user = data
          this.isUserLoaded = true
          return data
        })
        .catch((error) => {
          this.user = null
          this.isUserLoaded = true
          throw error
        })
    },
    resetUser() {
      this.user = null
      this.isUserLoaded = false
    },
  },
})

export default useUserStore
