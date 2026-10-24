import { es } from './es'
import { en } from './en'

export type Language = 'es' | 'en'
export type I18nKeys = typeof es

const translations: Record<Language, I18nKeys> = { es, en }

export function t(lang: Language): I18nKeys {
  return translations[lang]
}

export { localize, fmt } from './localize'
export { es, en }
