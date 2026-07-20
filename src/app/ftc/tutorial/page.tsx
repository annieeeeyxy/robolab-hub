"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

const card = "rounded-2xl border border-white/10 bg-white/[0.03] p-6";
const cardTitle = "font-mono text-[11px] uppercase tracking-[.18em] text-white/50";

export default function FtcTutorialPage() {
  const { t } = useTranslation();
  const steps = [1, 2, 3, 4, 5].map((n) => [t(`tfStep${n}T`), t(`tfStep${n}D`)]);
  const glance = ["Field", "Modes", "Scoring", "Telemetry"].map((k) => t(`tfGlance${k}`));

  return (
    <main className="min-h-screen bg-[#070a0f] text-white">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[.2em] text-cyan-300/80">{t("tfEyebrow")}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t("tfTitle")}</h1>
            <p className="mt-4 text-white/60">{t("tfLead")}</p>
          </div>
          <Link href="/ftc/simulator?level=beginner" className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-[#061014] transition-colors hover:bg-cyan-300">
            {t("tfOpen")} →
          </Link>
        </div>

        <div className="mt-10 rounded-r-2xl border-l-4 border-cyan-400 bg-cyan-400/10 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-cyan-300">{t("tfLoopLabel")}</p>
          <p className="mt-2 text-lg font-medium">{t("tfLoop")}</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className={card}>
            <h2 className={cardTitle}>{t("tfStepsTitle")}</h2>
            <ol className="mt-4 space-y-5">
              {steps.map(([title, desc], i) => (
                <li key={title} className="flex gap-4">
                  <span className="font-mono text-sm font-bold text-cyan-300">0{i + 1}</span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/60">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <section className={`${card} h-fit`}>
            <h2 className={cardTitle}>{t("tfGlanceTitle")}</h2>
            <ul className="mt-4 divide-y divide-white/5">
              {glance.map((g) => (
                <li key={g} className="py-2.5 text-sm leading-6 text-white/70">{g}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/ftc/simulator?level=beginner" className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-[#061014] transition-colors hover:bg-cyan-300">
            {t("tfOpen")} →
          </Link>
          <Link href="/ftc/intro" className="rounded-lg border border-cyan-400/40 px-5 py-3 font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/10">
            {t("tfSeeIntro")}
          </Link>
        </div>
      </div>
    </main>
  );
}
