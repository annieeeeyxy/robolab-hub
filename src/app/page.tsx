"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

const productStyles = {
  prompt: {
    border: "border-pink-400/20 hover:border-pink-300/45",
    glow: "from-pink-500/16 via-transparent to-transparent",
    badge: "bg-pink-400/10 text-pink-300 ring-pink-300/20",
    icon: "bg-gradient-to-br from-pink-300 to-rose-500 text-[#200812]",
    arrow: "text-pink-300",
  },
  ftc: {
    border: "border-cyan-400/20 hover:border-cyan-300/45",
    glow: "from-cyan-500/16 via-transparent to-transparent",
    badge: "bg-cyan-400/10 text-cyan-300 ring-cyan-300/20",
    icon: "bg-gradient-to-br from-cyan-300 to-blue-500 text-[#061014]",
    arrow: "text-cyan-300",
  },
};

export default function HubHome() {
  const { t } = useTranslation();
  const products = [
    {
      id: "prompt" as const,
      title: "RoboPrompt",
      kicker: t("hubPromptKicker"),
      description: t("hubPromptDescription"),
      bullets: [t("hubPromptBullet1"), t("hubPromptBullet2"), t("hubPromptBullet3")],
      cta: t("hubPromptCta"),
      href: "/roboprompt",
      symbol: "P",
    },
    {
      id: "ftc" as const,
      title: "RoboLab FTC",
      kicker: t("hubFtcKicker"),
      description: t("hubFtcDescription"),
      bullets: [t("hubFtcBullet1"), t("hubFtcBullet2"), t("hubFtcBullet3")],
      cta: t("hubFtcCta"),
      href: "/ftc",
      symbol: "F",
    },
  ];

  return (
    <main className="relative flex-1 overflow-hidden bg-[#070a0f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[38rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.12),transparent_62%)]" />

      <section className="relative mx-auto max-w-7xl px-5 pb-14 pt-20 text-center sm:px-8 sm:pt-28">
        <p className="mx-auto mb-6 w-fit rounded-full border border-cyan-300/15 bg-cyan-300/5 px-4 py-2 font-mono text-[10px] tracking-[.2em] text-cyan-200/80">
          {t("hubBadge")}
        </p>
        <h1 className="mx-auto max-w-4xl text-balance text-5xl font-semibold leading-[.98] tracking-[-.055em] sm:text-7xl">
          {t("hubTitle")}
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-balance text-base leading-7 text-white/55 sm:text-lg">
          {t("hubLead")}
        </p>
        <a href="#products" className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#070a0f] transition-transform hover:-translate-y-0.5">
          {t("hubExplore")} <span>↓</span>
        </a>
      </section>

      <section id="products" className="relative mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <p className="mb-7 text-center text-sm text-white/38">{t("hubChoose")}</p>
        <div className="grid gap-5 lg:grid-cols-2">
          {products.map((product) => {
            const style = productStyles[product.id];
            return (
              <Link key={product.id} href={product.href} className={`group relative overflow-hidden rounded-3xl border bg-[#0c1118] p-7 transition-all duration-300 hover:-translate-y-1 sm:p-10 ${style.border}`}>
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70 ${style.glow}`} />
                <div className="relative">
                  <div className="flex items-center justify-between gap-5">
                    <span className={`grid h-12 w-12 place-items-center rounded-2xl text-lg font-black shadow-xl ${style.icon}`}>{product.symbol}</span>
                    <span className={`rounded-full px-3 py-1.5 font-mono text-[9px] tracking-[.12em] ring-1 ${style.badge}`}>{product.kicker}</span>
                  </div>
                  <h2 className="mt-12 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{product.title}</h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/55 sm:text-base">{product.description}</p>
                  <ul className="mt-8 grid gap-3 text-sm text-white/72">
                    {product.bullets.map((bullet) => <li key={bullet} className="flex items-center gap-3"><span className={style.arrow}>✓</span>{bullet}</li>)}
                  </ul>
                  <div className="mt-10 flex items-center justify-between border-t border-white/8 pt-6 text-sm font-semibold">
                    <span>{product.cta}</span><span className={`text-xl transition-transform group-hover:translate-x-1 ${style.arrow}`}>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="relative border-t border-white/8 bg-white/[.015]">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-14 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-mono text-[10px] tracking-[.18em] text-cyan-300/70">{t("hubLanguageKicker")}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-.035em]">{t("hubLanguageTitle")}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">{t("hubLanguageDescription")}</p>
          </div>
          <p className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs text-white/65">{t("hubLanguageSupported")}</p>
        </div>
      </section>
    </main>
  );
}
