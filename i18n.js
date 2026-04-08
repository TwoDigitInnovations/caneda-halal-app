import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as Localization from 'react-native-localize';

import en from './locales/en.json';
import ar from './locales/ar.json'
import fr from './locales/fr.json'
import pt from './locales/pt.json'
import wo from './locales/wo.json'
import zh from './locales/zh.json'

const resources = {
  en: {translation: en},
  ar: {translation: ar},
  fr: {translation: fr},
  pt: {translation: pt},
  wo: {translation: wo},
  zh: {translation: zh},
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: callback => {
    const bestLanguage = Localization.findBestLanguageTag(
      Object.keys(resources),
    );
    callback(bestLanguage?.languageTag || 'en');
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
