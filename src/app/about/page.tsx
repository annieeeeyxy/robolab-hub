"use client";

import Image from "next/image";
import Link from "next/link";
import ASCIIText from "@/components/ASCIIText";
import SplitText from "@/components/SplitText";
import { useTranslation } from "@/hooks/useTranslation";
import { MEMBERS, type Member } from "@/content/members";

/**
 * About — the hub's one content page, written in the hero's vocabulary rather
 * than a second one of its own.
 *
 * What it borrows: the ASCII treatment for the page title and the project
 * names, the 3px rail down the left of every entry, mono micro-labels for
 * anything small, and SplitText for the lede. What it does not borrow is the
 * hero's fixed, clipped box — this page is in normal flow and scrolls, which is
 * the whole difference between a hero and a content page. No height is budgeted
 * anywhere.
 *
 * Deliberately absent: cards. The hero has no card, no filled button and no
 * rounded surface, so neither does this. Every grouping is a rail and a gap,
 * which is why `--surface` appears nowhere below.
 *
 * Two rules shape the details:
 *
 * 1. Brand colour is per product, never decorative. Pink is RoboPrompt, cyan is
 *    RoboLab FTC, and everything neutral — the team, the back link — is
 *    foreground/muted. The avatar fallbacks used to alternate pink and cyan by
 *    index, which made the colours mean nothing.
 * 2. Nothing revealed on hover may resize its own trigger, so every hover here
 *    is a colour transition.
 */

// Same lookup shape the hero uses, so a surface's colour is data rather than a
// conditional. Neutral surfaces simply do not appear in it.
const ACCENT = {
  prompt: { rail: "border-prompt", text: "text-prompt" },
  ftc: { rail: "border-ftc", text: "text-ftc" },
} as const;

type ProductId = keyof typeof ACCENT;

/**
 * The left rail: the hero's 7% page inset. Entries add their own 3px border and
 * pl-5 to reach the 7%+23px line; anything without a border takes RAIL_TEXT so
 * its glyphs start there too.
 */
const RAIL = "px-6 sm:pl-[7%] sm:pr-[7%]";
const RAIL_TEXT = "sm:ml-[23px]";

// Small labels, eyebrows and CTAs, per the type scale. Weight is left at the
// default: the Iosevka build ships 100/400/700 only, so 500/600 synthesise.
const EYEBROW = "font-mono text-[10px] uppercase tracking-[.18em]";

/** An entry's rail, which is the hero's only grouping device. */
const ENTRY = "border-l-[3px] pl-5";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function MemberLinks({
  member,
  emailLabel,
  siteLabel,
}: {
  member: Member;
  emailLabel: string;
  siteLabel: string;
}) {
  const links = [
    member.github && { label: "GitHub", href: `https://github.com/${member.github}` },
    member.website && { label: siteLabel, href: member.website },
    member.email && { label: emailLabel, href: `mailto:${member.email}` },
    // No profile URL to point at, so it reads as a handle rather than a link.
    member.discord && { label: `Discord · ${member.discord}`, href: null },
  ].filter((link): link is { label: string; href: string | null } => Boolean(link));

  if (links.length === 0) return null;

  return (
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
      {links.map((link) => (
        <li key={link.label}>
          {link.href ? (
            <a
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className={`${EYEBROW} text-muted transition-colors duration-200 hover:text-foreground`}
            >
              {link.label}
            </a>
          ) : (
            <span className={`${EYEBROW} text-muted`}>{link.label}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function AboutPage() {
  const { t } = useTranslation();

  const products = [
    {
      id: "prompt" as ProductId,
      title: "RoboPrompt",
      eyebrow: t("hpEyebrow"),
      lede: t("hpLede"),
      description: t("hpDesc"),
      features: [t("hpFeat1"), t("hpFeat2"), t("hpFeat3")],
      href: "/prompt",
      cta: t("hubPromptCta"),
    },
    {
      id: "ftc" as ProductId,
      title: "RoboLab FTC",
      eyebrow: t("hfEyebrow"),
      lede: t("hfLede"),
      description: t("hfDesc"),
      features: [t("hfFeat1"), t("hfFeat2"), t("hfFeat3")],
      href: "/ftc",
      cta: t("hubFtcCta"),
    },
  ];

  // The dictionary carries the line break, so each language chooses its own
  // split into two roughly even ASCII rows.
  const titleBlock = t("projectsTitle");
  const titleFlat = titleBlock.replace(/\n/g, " ");

  return (
    <main className="flex-1 bg-page pb-24 text-foreground">
      {/* Title. Padded clear of the nav tab, which is fixed to the top edge. */}
      <section className={`${RAIL} pt-24`}>
        <div className={RAIL_TEXT}>
          {/* ASCIIText positions itself absolutely inside its parent, so the
              parent must be explicitly sized. h-56 at asciiFontSize 6 is ~37
              character rows, well clear of the ~13-row legibility floor. */}
          <div className="relative hidden h-56 w-[62%] sm:block">
            <ASCIIText
              text={titleBlock}
              align="left"
              asciiFontSize={6}
              textFontSize={200}
              planeBaseHeight={18}
            />
          </div>
          {/* Mobile drops the WebGL planes entirely, as the hero does, and takes
              plain type in their place. */}
          <h1 className="max-w-xl text-4xl font-bold leading-[1.06] tracking-[-.02em] sm:hidden">
            {titleFlat}
          </h1>

          <SplitText
            text={t("projectsLead")}
            tag="p"
            splitType="chars"
            textAlign="left"
            delay={12}
            duration={0.5}
            ease="power3.out"
            // SplitText reveals through ScrollTrigger. At the stock threshold
            // anything already on screen never crosses the start line and stays
            // at opacity 0 forever.
            threshold={0.01}
            rootMargin="0px"
            from={{ opacity: 0, y: 14 }}
            to={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-xl text-sm leading-6 text-muted"
          />
        </div>
      </section>

      {/* Projects. One column rather than a two-up grid, so every project name
          starts on the same rail as the title above it — the hero's menu reads
          as a single vertical line of entries and this keeps that. */}
      <section className={`${RAIL} mt-24`}>
        <p className={`${EYEBROW} ${RAIL_TEXT} text-muted`}>{t("navProjects")}</p>

        <div className="mt-10 grid gap-16">
          {products.map((product) => {
            const accent = ACCENT[product.id];
            return (
              <article key={product.id} className={`${ENTRY} ${accent.rail}`}>
                {/* Fixed box, matching the hero's project names exactly. */}
                <div className="relative hidden h-20 w-[22rem] sm:block">
                  <ASCIIText
                    text={product.title}
                    align="left"
                    asciiFontSize={5}
                    textFontSize={200}
                    planeBaseHeight={20}
                  />
                </div>
                <h2 className="text-2xl font-thin tracking-[-.01em] sm:hidden">{product.title}</h2>

                <p className={`mt-3 ${EYEBROW} ${accent.text}`}>{product.eyebrow}</p>
                <p className="mt-4 max-w-xl font-bold leading-6">{product.lede}</p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{product.description}</p>

                <ul className="mt-6 grid max-w-xl gap-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-6 text-muted">
                      <span className={accent.text} aria-hidden="true">
                        ▸
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* A mono micro-label in the product's colour, the same shape as
                    the hero's "click to open" — the hub has no button style. */}
                <a
                  href={product.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-7 inline-block ${EYEBROW} ${accent.text} transition-opacity duration-200 hover:opacity-70`}
                >
                  {product.cta} →
                </a>
              </article>
            );
          })}
        </div>
      </section>

      {/* Team. Neutral throughout: it belongs to no product. Each member is the
          same rail entry as a project, just laid out in columns — six of them
          stacked full width would be a very long scroll for very little text. */}
      <section id="team" className={`${RAIL} mt-28`}>
        <div className={RAIL_TEXT}>
          <h2 className="text-2xl font-bold tracking-[-.01em]">{t("members")}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{t("hhMembersSub")}</p>
        </div>

        <ul className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {MEMBERS.map((member) => (
            <li
              key={member.slug}
              // Neutral rail that warms on hover, echoing the hero entry the arm
              // is touching. A colour change only — nothing here resizes.
              className={`${ENTRY} border-line/70 transition-colors duration-200 hover:border-foreground/70`}
            >
              <div className="flex items-center gap-4">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  // Neutral, not an alternating pink/cyan: a brand colour here
                  // would be decorative, and would dilute what it means.
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line font-mono text-xs font-bold text-muted">
                    {initials(member.name)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-lg font-thin tracking-[-.01em]">{member.name}</p>
                  <p className={`mt-1 ${EYEBROW} text-muted`}>{member.role}</p>
                </div>
              </div>

              {member.bio && <p className="mt-4 text-sm leading-6 text-muted">{member.bio}</p>}

              <MemberLinks member={member} emailLabel={t("linkEmail")} siteLabel={t("linkSite")} />
            </li>
          ))}
        </ul>
      </section>

      <section className={`${RAIL} mt-20`}>
        <Link
          href="/"
          className={`${RAIL_TEXT} inline-block ${EYEBROW} text-muted transition-colors duration-200 hover:text-foreground`}
        >
          ← {t("backToHub")}
        </Link>
      </section>
    </main>
  );
}
