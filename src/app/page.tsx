"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { RobotArmPicker } from "@/components/hero/RobotArmPicker";

export default function HubHome() {
  const { t } = useTranslation();

  const targets = [
    {
      id: "prompt" as const,
      name: "RoboPrompt",
      tagline: t("hpLede"),
      href: "/prompt",
      external: true,
    },
    {
      id: "ftc" as const,
      name: "RoboLab FTC",
      tagline: t("hfLede"),
      href: "/ftc",
      external: true,
    },
  ];

  return (
    // Scrolling is banned by rule, not by fitting: at `sm` and up the hero is a
    // fixed, clipped box pinned under the 4rem navbar. Being out of flow it can't
    // extend the page, so there is nothing to scroll and nothing to compute.
    // Mobile stays in normal flow — the navbar wraps there, so pinning would clip.
    <main className="relative bg-page px-6 py-10 text-foreground sm:fixed sm:inset-x-0 sm:bottom-0 sm:top-16 sm:overflow-hidden sm:p-0">
      <RobotArmPicker
        targets={targets}
        lockedLabel={t("heroLocked")}
        title={{ pre: t("heroTitlePre"), highlight: t("heroTitleHl"), post: t("heroTitlePost") }}
      />
    </main>
  );
}
