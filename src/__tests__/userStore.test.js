import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'

vi.mock('@/axios', () => ({
  axiosClient: {
    get: vi.fn(),
  },
}))

import useUserStore from '@/stores/user'
import { axiosClient } from '@/axios'

describe('useUserStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createTestingPinia({ stubActions: false }))
    store = useUserStore()
    vi.clearAllMocks()
  })

  describe('fetchUser', () => {
    it('should call API and populate user + isUserLoaded on first call', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' }
      axiosClient.get.mockResolvedValue({ data: mockUser })

      const result = await store.fetchUser()

      expect(axiosClient.get).toHaveBeenCalledTimes(1)
      expect(axiosClient.get).toHaveBeenCalledWith('/user')
      expect(store.user).toEqual(mockUser)
      expect(store.isUserLoaded).toBe(true)
      expect(result).toEqual(mockUser)
    })

    it('should NOT call API on second call when isUserLoaded is true', async () => {
      store.user = { id: 1, name: 'Cached' }
      store.isUserLoaded = true

      const result = await store.fetchUser()

      expect(axiosClient.get).not.toHaveBeenCalled()
      expect(result).toEqual({ id: 1, name: 'Cached' })
    })

    it('should set user to null and isUserLoaded to true on error', async () => {
      const error = new Error('Unauthorized')
      error.response = { status: 401 }
      axiosClient.get.mockRejectedValue(error)

      await expect(store.fetchUser()).rejects.toThrow()

      expect(store.user).toBeNull()
      expect(store.isUserLoaded).toBe(true)
    })
  })

  describe('resetUser', () => {
    it('should clear user and isUserLoaded', () => {
      store.user = { id: 1 }
      store.isUserLoaded = true

      store.resetUser()

      expect(store.user).toBeNull()
      expect(store.isUserLoaded).toBe(false)
    })
  })
})
