"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/context/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <details className="group relative">
      <summary
        className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-foreground/25 hover:text-foreground [&::-webkit-details-marker]:hidden"
        title={t("changeLanguage")}
        aria-label={t("changeLanguage")}
      >
        <span className="text-sm">
          {LANGUAGES.find((l) => l.code === language)?.flag || "🌐"}
        </span>
        <span className="hidden sm:inline">
          {LANGUAGES.find((l) => l.code === language)?.name}
        </span>
        <span className="text-[9px] text-muted">▼</span>
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-2xl">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={(event) => {
              setLanguage(lang.code);
              event.currentTarget.closest("details")?.removeAttribute("open");
            }}
            className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
              language === lang.code
                ? "bg-ftc/10 font-medium text-ftc"
                : "text-muted hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </details>
  );
}
