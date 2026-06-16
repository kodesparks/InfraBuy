import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import te from './te.json';

const LANGUAGE_KEY = '@app_language';

const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: async (callback) => {
        try {
            const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
            if (storedLanguage) {
                return callback(storedLanguage);
            }
            return callback('en'); // Default language
        } catch (error) {
            console.log('Error reading language', error);
            return callback('en');
        }
    },
    init: () => { },
    cacheUserLanguage: async (language) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, language);
        } catch (error) {
            console.log('Error saving language', error);
        }
    },
};

i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        resources: {
            en,
            te,
        },
        interpolation: {
            escapeValue: false, // React already safe from xss
        },
        react: {
            useSuspense: false, // Since we are using async language detection
        },
    });

export default i18n;
