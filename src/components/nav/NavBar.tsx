"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { HubLogo } from "./RobotLogo";

export function NavBar() {
  const { t } = useTranslation();

  return (
    <header className="relative z-50 border-b border-line bg-surface/90 text-foreground backdrop-blur-xl">
      <nav className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-lg tracking-tight">
          <HubLogo className="h-8 w-8" />
          <span>Robo<b className="font-normal text-prompt">Lab</b> <b className="font-normal text-ftc">Hub</b></span>
        </Link>
        <div className="order-3 flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:w-auto sm:flex-1">
          <Link href="/projects" className="whitespace-nowrap rounded-full px-3 py-1.5 font-bold text-[15px] tracking-wide text-muted transition-colors hover:bg-foreground/5 hover:text-foreground">{t("navProjects")}</Link>
          <a href="/prompt" className="whitespace-nowrap rounded-full px-3 py-1.5 font-bold text-[15px] tracking-wide text-muted transition-colors hover:bg-foreground/5 hover:text-foreground">{t("roboPrompt")}</a>
          <a href="/ftc" className="whitespace-nowrap rounded-full px-3 py-1.5 font-bold text-[15px] tracking-wide text-muted transition-colors hover:bg-foreground/5 hover:text-foreground">{t("roboLabFtc")}</a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
