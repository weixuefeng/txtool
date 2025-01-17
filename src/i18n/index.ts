import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { zhTransaction, enTransaction } from './locale'

const resources = {
  en: {
    translation: enTransaction,
  },
  zh: {
    translation: zhTransaction,
  },
}

function detecteLanguage() {
  return navigator.language.toLowerCase().indexOf('en') > -1 ? 'en' : 'zh'
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: detecteLanguage(),
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export default i18n
