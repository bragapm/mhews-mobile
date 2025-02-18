import { create } from "zustand";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageStore {
    selectedLanguage: string;
    setSelectedLanguage: (language: string) => void;
    loadLanguage: () => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
    selectedLanguage: 'indonesia',
    setSelectedLanguage: async (language) => {
        set({ selectedLanguage: language });
        await AsyncStorage.setItem('selectedLanguage', language);
    },
    loadLanguage: async () => {
        const language = await AsyncStorage.getItem('selectedLanguage');
        if (language) {
            set({ selectedLanguage: language });
        }
    },
}));
