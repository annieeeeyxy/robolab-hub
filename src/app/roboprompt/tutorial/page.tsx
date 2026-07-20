"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

const card = "rounded-2xl border border-white/10 bg-white/[0.03] p-6";
const cardTitle = "font-mono text-[11px] uppercase tracking-[.18em] text-white/50";

export default function RoboPromptTutorialPage() {
  const { t } = useTranslation();
  const steps = [1, 2, 3, 4, 5].map((n) => [t(`trStep${n}T`), t(`trStep${n}D`)]);
  const hardware = ["A", "B", "Lang"].map((k) => t(`trHw${k}`));

  return (
    <main className="min-h-screen bg-[#070a0f] text-white">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[.2em] text-pink-300/80">{t("trEyebrow")}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t("trTitle")}</h1>
            <p className="mt-4 text-white/60">{t("trLead")}</p>
          </div>
          <a href="https://robo-prompt.vercel.app/" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-pink-400 px-5 py-3 font-semibold text-[#200812] transition-colors hover:bg-pink-300">
            {t("trTry")} ↗
          </a>
        </div>

        <div className="mt-10 rounded-r-2xl border-l-4 border-pink-400 bg-pink-400/10 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-pink-300">{t("trPrincipleLabel")}</p>
          <p className="mt-2 text-balance text-lg font-medium">{t("trPrinciple")}</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className={card}>
            <h2 className={cardTitle}>{t("trStepsTitle")}</h2>
            <ol className="mt-4 space-y-5">
              {steps.map(([title, desc], i) => (
                <li key={title} className="flex gap-4">
                  <span className="font-mono text-sm font-bold text-pink-300">0{i + 1}</span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/60">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <div className="grid content-start gap-6">
            <section className={card}>
              <h2 className={cardTitle}>{t("trWhyTitle")}</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">{t("trWhyText")}</p>
            </section>
            <section className={card}>
              <h2 className={cardTitle}>{t("trHwTitle")}</h2>
              <ul className="mt-4 divide-y divide-white/5">
                {hardware.map((h) => (
                  <li key={h} className="py-2.5 text-sm leading-6 text-white/70">{h}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a href="https://robo-prompt.vercel.app/" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-pink-400 px-5 py-3 font-semibold text-[#200812] transition-colors hover:bg-pink-300">
            {t("trTry")} ↗
          </a>
          <Link href="/roboprompt/about" className="rounded-lg border border-pink-400/40 px-5 py-3 font-semibold text-pink-300 transition-colors hover:bg-pink-400/10">
            {t("about")}
          </Link>
        </div>
      </div>
    </main>
  );
}
