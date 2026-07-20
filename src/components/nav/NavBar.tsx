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
        </div>
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
