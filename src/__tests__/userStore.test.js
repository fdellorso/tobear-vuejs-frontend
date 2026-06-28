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
    localStorage.clear()
  })

  describe('mode initial state', () => {
    it('should start with mode null', () => {
      expect(store.mode).toBeNull()
    })

    it('should default isAuthenticated to false when mode is null', () => {
      expect(store.isAuthenticated).toBe(false)
    })

    it('should default isAuthenticated to false when mode is guest', () => {
      store.mode = 'guest'
      expect(store.isAuthenticated).toBe(false)
    })

    it('should return true for isAuthenticated when mode is authenticated', () => {
      store.mode = 'authenticated'
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('loadMode', () => {
    it('should restore mode from localStorage', () => {
      localStorage.setItem('tobear_mode', 'guest')
      store.loadMode()
      expect(store.mode).toBe('guest')
    })

    it('should restore authenticated from localStorage', () => {
      localStorage.setItem('tobear_mode', 'authenticated')
      store.loadMode()
      expect(store.mode).toBe('authenticated')
    })

    it('should not change mode if localStorage has unknown value', () => {
      localStorage.setItem('tobear_mode', 'unknown')
      store.loadMode()
      expect(store.mode).toBeNull()
    })

    it('should not change mode if localStorage is empty', () => {
      store.loadMode()
      expect(store.mode).toBeNull()
    })
  })

  describe('setMode', () => {
    it('should set mode and save to localStorage', () => {
      store.setMode('guest')
      expect(store.mode).toBe('guest')
      expect(localStorage.getItem('tobear_mode')).toBe('guest')
    })

    it('should remove localStorage key when mode is null', () => {
      localStorage.setItem('tobear_mode', 'guest')
      store.setMode(null)
      expect(store.mode).toBeNull()
      expect(localStorage.getItem('tobear_mode')).toBeNull()
    })
  })

  describe('clearSession', () => {
    it('should clear user and isUserLoaded but not mode', () => {
      store.user = { id: 1 }
      store.isUserLoaded = true
      store.mode = 'authenticated'

      store.clearSession()

      expect(store.user).toBeNull()
      expect(store.isUserLoaded).toBe(false)
      expect(store.mode).toBe('authenticated')
    })
  })

  describe('fetchUser', () => {
    it('should call API and populate user + isUserLoaded + set mode authenticated on first call', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' }
      axiosClient.get.mockResolvedValue({ data: mockUser })

      const result = await store.fetchUser()

      expect(axiosClient.get).toHaveBeenCalledTimes(1)
      expect(axiosClient.get).toHaveBeenCalledWith('/user')
      expect(store.user).toEqual(mockUser)
      expect(store.isUserLoaded).toBe(true)
      expect(store.mode).toBe('authenticated')
      expect(localStorage.getItem('tobear_mode')).toBe('authenticated')
      expect(result).toEqual(mockUser)
    })

    it('should NOT call API on second call when isUserLoaded is true', async () => {
      store.user = { id: 1, name: 'Cached' }
      store.isUserLoaded = true

      const result = await store.fetchUser()

      expect(axiosClient.get).not.toHaveBeenCalled()
      expect(result).toEqual({ id: 1, name: 'Cached' })
    })

    it('should set user to null and isUserLoaded to true on error but not change mode', async () => {
      store.mode = 'authenticated'
      const error = new Error('Unauthorized')
      error.response = { status: 401 }
      axiosClient.get.mockRejectedValue(error)

      await expect(store.fetchUser()).rejects.toThrow()

      expect(store.user).toBeNull()
      expect(store.isUserLoaded).toBe(true)
      expect(store.mode).toBe('authenticated')
    })
  })

  describe('resetUser', () => {
    it('should clear user, isUserLoaded, and set mode to guest + localStorage', () => {
      store.user = { id: 1 }
      store.isUserLoaded = true
      store.mode = 'authenticated'

      store.resetUser()

      expect(store.user).toBeNull()
      expect(store.isUserLoaded).toBe(false)
      expect(store.mode).toBe('guest')
      expect(localStorage.getItem('tobear_mode')).toBe('guest')
    })
  })
})
