"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { HubLogo } from "./RobotLogo";

export function NavBar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isPrompt = pathname.startsWith("/roboprompt");
  const isFtc = pathname.startsWith("/ftc");
  const links = isPrompt
    ? [
        { href: "/roboprompt", label: t("overview") },
        { href: "/roboprompt/about", label: t("about") },
        { href: "/roboprompt/tutorial", label: t("navTutorial") },
        { href: "/roboprompt/members", label: t("members") },
        { href: "/roboprompt/diary", label: t("diary") },
        { href: "https://robo-prompt.vercel.app/", label: t("tryIt"), external: true },
      ]
    : isFtc
      ? [
          { href: "/ftc", label: t("overview") },
          { href: "/ftc/intro", label: t("navIntro") },
          { href: "/ftc/tutorial", label: t("navTutorial") },
          { href: "/ftc/simulator?level=beginner", label: t("simulator") },
          { href: "https://gcet-gold.vercel.app/", label: t("navStart"), external: true },
          { href: "/ftc/student", label: t("teamMember") },
        ]
      : [];

  return (
    <header className="relative z-50 border-b border-white/10 bg-[#080b10]/95 text-white backdrop-blur-xl">
      <nav className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <HubLogo className="h-8 w-8" />
          <span>Robo<b className="font-medium text-pink-400">Lab</b> <b className="font-medium text-blue-400">Hub</b></span>
        </Link>
        <div className="order-3 flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:w-auto sm:flex-1">
          <Link href="/roboprompt" className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${isPrompt ? "bg-pink-400/15 text-pink-300" : "text-white/55 hover:bg-white/5 hover:text-white"}`}>{t("roboPrompt")}</Link>
          <Link href="/ftc" className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${isFtc ? "bg-cyan-400/15 text-cyan-300" : "text-white/55 hover:bg-white/5 hover:text-white"}`}>{t("roboLabFtc")}</Link>
          {links.length > 0 && <span className="mx-2 h-4 w-px shrink-0 bg-white/10" />}
          <ul className="flex gap-1 text-sm">
            {links.map((link) => {
              if ("external" in link && link.external) {
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full px-3 py-1.5 text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {link.label} ↗
                    </a>
                  </li>
                );
              }
              const cleanHref = link.href.split("?")[0];
              const isActive = cleanHref === "/roboprompt" || cleanHref === "/ftc"
                ? pathname === cleanHref
                : pathname.startsWith(cleanHref);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`rounded-full px-3 py-1.5 transition-colors ${
                      isActive
                        ? "bg-white/10 font-medium text-white"
                        : "text-white/45 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
