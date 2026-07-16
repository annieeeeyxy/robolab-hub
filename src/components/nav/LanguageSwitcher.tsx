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
        className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white [&::-webkit-details-marker]:hidden"
        title={t("changeLanguage")}
        aria-label={t("changeLanguage")}
      >
        <span className="text-sm">
          {LANGUAGES.find((l) => l.code === language)?.flag || "🌐"}
        </span>
        <span className="hidden sm:inline">
          {LANGUAGES.find((l) => l.code === language)?.name}
        </span>
        <span className="text-[9px] text-white/35">▼</span>
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#10151d] p-1 shadow-2xl">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={(event) => {
              setLanguage(lang.code);
              event.currentTarget.closest("details")?.removeAttribute("open");
            }}
            className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
              language === lang.code
                ? "bg-cyan-400/10 font-medium text-cyan-300"
                : "text-white/65 hover:bg-white/5 hover:text-white"
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
