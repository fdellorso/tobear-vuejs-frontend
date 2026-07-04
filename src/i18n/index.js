import { createI18n } from 'vue-i18n'
import en from './en.json'
import it from './it.json'

const savedLocale = localStorage.getItem('tobear_locale') || 'en'

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, it },
})
