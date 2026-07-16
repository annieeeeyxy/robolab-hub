"use client";

import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { getHubTranslation } from "@/lib/hubTranslations";

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string, values?: Record<string, string | number>): string => {
    const message = getHubTranslation(language, key) ?? getTranslation(language, key);
    if (!values) return message;
    return message.replace(/\{(\w+)\}/g, (match, name: string) =>
      Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match,
    );
  };

  return { t, language };
}
