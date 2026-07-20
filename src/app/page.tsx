"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { MEMBERS } from "@/content/members";

const productStyles = {
  prompt: {
    top: "border-t-pink-400",
    eyebrow: "text-pink-300",
    bullet: "text-pink-300",
    solid: "bg-pink-400 text-[#200812] hover:bg-pink-300",
    ghost: "border-pink-400/40 text-pink-300 hover:bg-pink-400/10",
  },
  ftc: {
    top: "border-t-blue-400",
    eyebrow: "text-blue-300",
    bullet: "text-blue-300",
    solid: "bg-blue-400 text-[#061014] hover:bg-blue-300",
    ghost: "border-blue-400/40 text-blue-300 hover:bg-blue-400/10",
  },
};

const avatarColors = ["bg-pink-400", "bg-blue-400"];

export default function HubHome() {
  const { t } = useTranslation();

  const products = [
    {
      id: "prompt" as const,
      title: "RoboPrompt",
      eyebrow: t("hpEyebrow"),
      lede: t("hpLede"),
      description: t("hpDesc"),
      features: [t("hpFeat1"), t("hpFeat2"), t("hpFeat3")],
      intro: "/roboprompt/about",
      demo: "/roboprompt/tutorial",
      tryIt: "/roboprompt/try",
    },
    {
      id: "ftc" as const,
      title: "RoboLab FTC",
      eyebrow: t("hfEyebrow"),
      lede: t("hfLede"),
      description: t("hfDesc"),
      features: [t("hfFeat1"), t("hfFeat2"), t("hfFeat3")],
      intro: "/ftc/intro",
      demo: "/ftc/tutorial",
      tryIt: "https://gcet-gold.vercel.app/",
      external: true,
    },
  ];

  return (
    <main className="flex-1 bg-[#0b0c10] text-white">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pb-12 pt-16 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[.2em] text-white/45">{t("hhEyebrow")}</p>
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-[-.025em] sm:text-5xl">
          {t("hhTitle1Pre")} <span className="text-pink-400">{t("hhTitle1Hl")}</span> {t("hhTitle1Post")}
          <br />
          {t("hhTitle2Pre")} <span className="text-blue-400">{t("hhTitle2Hl")}</span> {t("hhTitle2Post")}
        </h1>
        <p className="mt-5 max-w-3xl leading-7 text-white/55">{t("hhLead")}</p>
      </section>

      {/* Two product blocks */}
      <section className="mx-auto grid max-w-5xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-2">
        {products.map((product) => {
          const style = productStyles[product.id];
          return (
            <article key={product.id} className={`flex flex-col gap-4 rounded-lg border border-white/10 border-t-4 bg-white/[.03] p-7 ${style.top}`}>
              <p className={`font-mono text-[11px] font-bold uppercase tracking-[.16em] ${style.eyebrow}`}>{product.eyebrow}</p>
              <h2 className="text-3xl font-extrabold tracking-[-.02em]">{product.title}</h2>
              <p className="font-medium">{product.lede}</p>
              <p className="text-sm leading-6 text-white/55">{product.description}</p>
              <ul className="grid gap-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-white/60">
                    <span className={style.bullet}>▸</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap gap-3 pt-3">
                <Link href={product.intro} className={`flex-1 rounded border-[1.5px] px-4 py-3 text-center font-mono text-sm font-bold ${style.ghost}`}>
                  {t("navIntro")}
                </Link>
                <Link href={product.demo} className={`flex-1 rounded border-[1.5px] px-4 py-3 text-center font-mono text-sm font-bold ${style.ghost}`}>
                  {t("navDemo")}
                </Link>
                {"external" in product && product.external ? (
                  <a
                    href={product.tryIt}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 rounded border-[1.5px] border-transparent px-4 py-3 text-center font-mono text-sm font-bold ${style.solid}`}
                  >
                    {t("tryIt")} ↗
                  </a>
                ) : (
                  <Link href={product.tryIt} className={`flex-1 rounded border-[1.5px] border-transparent px-4 py-3 text-center font-mono text-sm font-bold ${style.solid}`}>
                    {t("tryIt")} →
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* Members */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
          <h2 className="text-2xl font-extrabold tracking-[-.02em] sm:text-3xl">{t("members")}</h2>
          <p className="mt-1 text-white/55">{t("hhMembersSub")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MEMBERS.map((member, index) => (
              <Link
                key={member.slug}
                href={`/roboprompt/members/${member.slug}`}
                className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[.03] px-5 py-4 transition-colors hover:border-white/30 hover:bg-white/[.06]"
              >
                {member.photo ? (
                  <Image src={member.photo} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full font-mono text-sm font-bold text-white ${avatarColors[index % 2]}`}>
                    {member.name.split(" ").map((part) => part[0]).join("").toUpperCase()}
                  </span>
                )}
                <span className="flex-1 font-semibold">{member.name}</span>
                <span className="font-mono text-white/40">›</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Language strip */}
      <section className="border-t border-white/10 bg-white/[.015]">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-white/45">{t("hubLanguageKicker")}</p>
            <h2 className="mt-3 text-xl font-bold tracking-[-.02em]">{t("hubLanguageTitle")}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">{t("hubLanguageDescription")}</p>
          </div>
          <p className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs text-white/65">{t("hubLanguageSupported")}</p>
        </div>
      </section>
    </main>
  );
}
