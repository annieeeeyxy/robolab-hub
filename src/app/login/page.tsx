"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { normalizeInternalRedirect } from "@/lib/redirect";

function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        throw new Error(res.status === 401 ? t("loginIncorrectPassword") : t("loginSomethingWentWrong"));
      }
      const redirect = normalizeInternalRedirect(searchParams.get("redirect"), "/roboprompt/try");
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginSomethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-xl font-semibold">{t("loginTitle")}</h1>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          {t("loginDescription")}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("loginPasswordPlaceholder")}
          autoFocus
          className="w-full rounded-xl border border-black/15 bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-pink-500 dark:border-white/15"
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="rounded-full bg-pink-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-pink-500 disabled:opacity-40"
        >
          {loading ? t("loginChecking") : t("loginContinue")}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
