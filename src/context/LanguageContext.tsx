"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "es" | "fr" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);
const STORAGE_KEY = "robolab-hub-language";
const LEGACY_STORAGE_KEY = "language";
const SUPPORTED_LANGUAGES: Language[] = ["en", "es", "fr", "zh"];

function isLanguage(value: string | null): value is Language {
  return value !== null && SUPPORTED_LANGUAGES.includes(value as Language);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (isLanguage(saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading persisted language from localStorage, not derivable during SSR render
      setLanguageState(saved);
      localStorage.setItem(STORAGE_KEY, saved);
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (isLanguage(browserLang)) {
        setLanguageState(browserLang as Language);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const syncLanguage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && isLanguage(event.newValue)) {
        setLanguageState(event.newValue);
      }
    };
    window.addEventListener("storage", syncLanguage);
    return () => window.removeEventListener("storage", syncLanguage);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
