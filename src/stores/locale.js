import { defineStore } from 'pinia'
import { i18n } from '@/i18n'

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    locale: localStorage.getItem('tobear_locale') || 'en',
  }),

  actions: {
    setLocale(value) {
      this.locale = value
      localStorage.setItem('tobear_locale', value)
      i18n.global.locale.value = value
    },
  },
})
