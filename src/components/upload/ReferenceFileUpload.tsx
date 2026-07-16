"use client";

import { useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export type ReferenceFileEntry = { file: File; description: string };

export function ReferenceFileUpload({
  entries,
  onChange,
  disabled,
}: {
  entries: ReferenceFileEntry[];
  onChange: (entries: ReferenceFileEntry[]) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{t("referenceMaterialsOptional")}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="text-xs font-medium text-pink-600 hover:underline disabled:opacity-50 dark:text-pink-400"
        >
          + {t("addFiles")}
        </button>
      </div>
      <p className="text-xs text-black/50 dark:text-white/50">
        {t("referenceMaterialsHint")}
      </p>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length === 0) return;
          onChange([...entries, ...files.map((file) => ({ file, description: "" }))]);
          e.target.value = "";
        }}
      />

      {entries.length > 0 && (
        <ul className="flex flex-col gap-2">
          {entries.map((entry, i) => (
            <li
              key={`${entry.file.name}-${i}`}
              className="flex items-start gap-2 rounded-xl border border-black/10 p-3 dark:border-white/10"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{entry.file.name}</p>
                <input
                  type="text"
                  value={entry.description}
                  onChange={(e) =>
                    onChange(
                      entries.map((it, j) => (j === i ? { ...it, description: e.target.value } : it))
                    )
                  }
                  placeholder={t("referenceFileDescriptionPlaceholder")}
                  disabled={disabled}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-pink-500 disabled:opacity-50 dark:border-white/10"
                />
              </div>
              <button
                type="button"
                onClick={() => onChange(entries.filter((_, j) => j !== i))}
                disabled={disabled}
                aria-label={t("removeReferenceFile", { filename: entry.file.name })}
                className="shrink-0 text-xs text-black/40 hover:text-red-600 disabled:opacity-50 dark:text-white/40 dark:hover:text-red-400"
              >
                {t("remove")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
