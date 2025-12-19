import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Language } from './types';
import { DICTIONARY, PROFILE, PROFILE_VI } from './constants';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof DICTIONARY.en) => string;
  profile: typeof PROFILE;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'vi' : 'en'));
  };

  const t = (key: keyof typeof DICTIONARY.en) => {
    return DICTIONARY[language][key] || key;
  };

  const profile = language === 'en' ? PROFILE : PROFILE_VI;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, profile }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};