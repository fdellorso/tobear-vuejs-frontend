import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: localStorage.getItem('tobear_theme') || 'system',
    _mediaQuery: null,
  }),

  actions: {
    init() {
      this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      this._mediaQuery.addEventListener('change', () => {
        if (this.theme === 'system') this._applyTheme()
      })
      this._applyTheme()
    },

    setTheme(value) {
      this.theme = value
      localStorage.setItem('tobear_theme', value)
      this._applyTheme()
    },

    _applyTheme() {
      const isDark =
        this.theme === 'dark' ||
        (this.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    },
  },
})
