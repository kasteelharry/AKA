import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'


// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .use(HttpApi)
  .init({

    fallbackLng: "en",
    
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'path', 'htmlTag', 'subdomain'],
      caches: ['cookie'],
    },

    backend: {
      loadPath: '/assets/locales/{{lng}}.json',
      allowMultiLoading: true,
    },

    react: {useSuspense: false},
  });

  export default i18n;