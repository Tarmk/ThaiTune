import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './public/locales/en/common.json';
import enDashboard from './public/locales/en/dashboard.json';

// the translations
const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // if you're using a language detector, do not define the lng option
    ns: ['common', 'dashboard'], // specify the namespaces
    defaultNS: 'common', // set the default namespace
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;