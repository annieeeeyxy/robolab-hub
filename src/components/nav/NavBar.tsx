"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { HubLogo } from "./RobotLogo";

/**
 * The bar is hidden by default and drops down when the tab is clicked, so the
 * hero owns the whole viewport. It is `fixed` rather than in flow: sliding an
 * in-flow header would push the hero down every time it opened.
 */
export function NavBar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Escape closes it — the trigger is a small target and the panel covers the
  // top of the page while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Brand names carry their own colour here, matching the hero's accents.
  const linkBase =
    "whitespace-nowrap rounded-full px-3 py-1.5 font-bold text-[15px] tracking-wide transition-colors hover:bg-foreground/5";
  const neutralLink = `${linkBase} text-muted hover:text-foreground`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-line bg-surface/95 text-foreground backdrop-blur-xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
        aria-hidden={!open}
      >
        {/* Left-aligned rather than centred in a max-width column: the padding
            matches the hero's 7% inset plus the entries' 3px border + pl-5, so
            the wordmark starts on the same vertical line as the ASCII type
            underneath it. */}
        <nav className="flex min-h-16 flex-wrap items-center gap-x-5 gap-y-3 py-3 pl-[calc(7%+23px)] pr-4 sm:pr-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-bold text-lg tracking-tight"
            aria-label="RoboLab Hub"
          >
            <HubLogo className="h-8 w-8" />
            {/* The bar is only 64px tall, which leaves the ASCII grid too few
                rows to stay legible, so the wordmark keeps real type. */}
            <span>Robo<b className="font-normal text-prompt">Lab</b> <b className="font-normal text-ftc">Hub</b></span>
          </Link>
          <div className="order-3 flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:w-auto sm:flex-1">
            <Link href="/about" className={neutralLink}>{t("navAbout")}</Link>
            <a href="/prompt" className={`${linkBase} text-prompt hover:text-prompt`}>{t("roboPrompt")}</a>
            <a href="/ftc" className={`${linkBase} text-ftc hover:text-ftc`}>{t("roboLabFtc")}</a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

      {/* Rides along the bottom edge of the panel, so it sits at the top of the
          screen when closed and below the bar when open. Never tab-trapped
          behind the hidden panel: it is a sibling, not a child. */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Hide navigation" : "Show navigation"}
        className={`fixed left-1/2 z-[60] -translate-x-1/2 rounded-b-xl border border-t-0 border-line bg-surface/95 px-5 py-1.5 text-foreground shadow-lg backdrop-blur-xl transition-all duration-300 ease-out hover:bg-surface ${
          open ? "top-16" : "top-0"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-6 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 9l8 7 8-7" />
        </svg>
      </button>
    </>
  );
}
