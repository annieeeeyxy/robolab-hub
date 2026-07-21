"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { MEMBERS } from "@/content/members";

const productStyles = {
  prompt: {
    top: "border-t-pink-500 dark:border-t-pink-400",
    eyebrow: "text-pink-600 dark:text-pink-300",
    bullet: "text-pink-600 dark:text-pink-300",
    solid: "bg-pink-600 text-white hover:bg-pink-500 dark:bg-pink-400 dark:text-[#200812] dark:hover:bg-pink-300",
  },
  ftc: {
    top: "border-t-cyan-500 dark:border-t-cyan-400",
    eyebrow: "text-cyan-700 dark:text-cyan-300",
    bullet: "text-cyan-700 dark:text-cyan-300",
    solid: "bg-cyan-600 text-white hover:bg-cyan-500 dark:bg-cyan-400 dark:text-[#061014] dark:hover:bg-cyan-300",
  },
};

const avatarColors = ["bg-pink-500 dark:bg-pink-400", "bg-cyan-600 dark:bg-cyan-400"];

export default function ProjectsPage() {
  const { t } = useTranslation();

  const products = [
    {
      id: "prompt" as const,
      title: "RoboPrompt",
      eyebrow: t("hpEyebrow"),
      lede: t("hpLede"),
      description: t("hpDesc"),
      features: [t("hpFeat1"), t("hpFeat2"), t("hpFeat3")],
      href: "/prompt",
      cta: t("hubPromptCta"),
    },
    {
      id: "ftc" as const,
      title: "RoboLab FTC",
      eyebrow: t("hfEyebrow"),
      lede: t("hfLede"),
      description: t("hfDesc"),
      features: [t("hfFeat1"), t("hfFeat2"), t("hfFeat3")],
      href: "/ftc",
      cta: t("hubFtcCta"),
    },
  ];

  return (
    <main className="flex-1 bg-page text-foreground">
      <section className="mx-auto max-w-5xl px-5 pb-10 pt-16 sm:px-8">
        <h1 className="max-w-3xl text-balance text-4xl font-bold leading-[1.08] tracking-[-.02em] sm:text-5xl">
          {t("projectsTitle")}
        </h1>
        <p className="mt-5 max-w-3xl leading-7 text-muted">{t("projectsLead")}</p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-5 pb-12 sm:px-8 lg:grid-cols-2">
        {products.map((product) => {
          const style = productStyles[product.id];
          return (
            <article key={product.id} className={`flex flex-col gap-4 rounded-lg border border-line border-t-4 bg-surface p-7 ${style.top}`}>
              <p className={`font-mono text-[11px] font-bold uppercase tracking-[.16em] ${style.eyebrow}`}>{product.eyebrow}</p>
              <h2 className="text-3xl font-bold tracking-[-.02em]">{product.title}</h2>
              <p className="font-medium">{product.lede}</p>
              <p className="text-sm leading-6 text-muted">{product.description}</p>
              <ul className="grid gap-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-muted">
                    <span className={style.bullet}>▸</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={product.href}
                target="_blank"
                rel="noreferrer"
                className={`mt-auto rounded border-[1.5px] border-transparent px-4 py-3 text-center font-mono text-sm font-bold ${style.solid}`}
              >
                {product.cta} →
              </a>
            </article>
          );
        })}
      </section>

      <section id="team" className="border-t border-line">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
          <h2 className="text-2xl font-bold tracking-[-.02em] sm:text-3xl">{t("members")}</h2>
          <p className="mt-1 text-muted">{t("hhMembersSub")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MEMBERS.map((member, index) => (
              <article key={member.slug} className="flex items-center gap-4 rounded-lg border border-line bg-surface px-5 py-4">
                {member.photo ? (
                  <Image src={member.photo} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full font-mono text-sm font-bold text-white ${avatarColors[index % 2]}`}>
                    {member.name.split(" ").map((part) => part[0]).join("").toUpperCase()}
                  </span>
                )}
                <span className="flex-1 font-thin">{member.name}</span>
                <span className="text-xs text-muted">{member.role}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <Link href="/" className="font-mono text-sm text-muted transition-colors hover:text-foreground">
          ← {t("backToHub")}
        </Link>
      </section>
    </main>
  );
}
