import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@/locales/en-US.json'
import zh from '@/locales/zh-CN.json'
import { getLocales } from 'expo-localization'

i18n.use(initReactI18next).init({
  lng: getLocales()[0]?.languageCode || '',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
})

export default i18n
