"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function FtcLandingPage() {
  const { t } = useTranslation();
  const paths = [
    { level: "01", tag: t("ftcBeginner"), title: t("ftcBeginnerTitle"), description: t("ftcBeginnerDescription"), outcome: t("ftcBeginnerOutcome"), href: "/ftc/simulator?level=beginner", cta: t("ftcBeginnerCta"), accent: "cyan" },
    { level: "02", tag: t("ftcIntermediate"), title: t("ftcIntermediateTitle"), description: t("ftcIntermediateDescription"), outcome: t("ftcIntermediateOutcome"), href: "/ftc/simulator?level=intermediate", cta: t("ftcIntermediateCta"), accent: "purple" },
    { level: "03", tag: t("ftcAdvanced"), title: t("ftcAdvancedTitle"), description: t("ftcAdvancedDescription"), outcome: t("ftcAdvancedOutcome"), href: "/ftc/simulator?level=advanced", cta: t("ftcAdvancedCta"), accent: "amber" },
  ];
  const loop = [
    ["1", t("ftcLoop1Title"), t("ftcLoop1Text")],
    ["2", t("ftcLoop2Title"), t("ftcLoop2Text")],
    ["3", t("ftcLoop3Title"), t("ftcLoop3Text")],
  ];

  return (
    <main className="landing-shell ftc-surface">
      <section className="hero beginner-hero">
        <div className="hero-copy">
          <div className="eyebrow"><span>●</span>{t("ftcSafePlace")}</div>
          <h1>{t("ftcHeroTitle")}<br /><em>{t("ftcHeroEmphasis")}</em></h1>
          <p className="hero-lede">{t("ftcHeroLead")}</p>
          <div className="plain-proof"><span>✓ {t("ftcNoHardware")}</span><span>✓ {t("ftcMissionIncluded")}</span><span>✓ {t("ftcNothingInstall")}</span></div>
          <div className="hero-actions">
            <Link href="/ftc/simulator?level=beginner" className="button button-primary">{t("ftcStartZero")} <span>→</span></Link>
            <a href="#paths" className="text-link">{t("ftcChooseLevel")} <span>↓</span></a>
          </div>
        </div>

        <div className="hero-visual lab-preview" aria-label={t("ftcFirstMission")}>
          <div className="preview-topbar"><span><i /> {t("ftcFirstMission")}</span><span>{t("ftcThreeMinutes")}</span></div>
          <div className="mission-preview">
            <div className="mission-copy"><small>{t("ftcYourGoal")}</small><strong>{t("ftcPreviewGoal")}</strong><p>{t("ftcPreviewHelp")}</p></div>
            <div className="mini-code"><span>1</span><code>driveForward(<b>24</b>);</code><span>2</span><code>driveLeft(<b>12</b>);</code></div>
            <div className="mini-stage"><div className="stage-grid" /><div className="start-flag">{t("ftcStartFlag")}</div><div className="finish-flag">{t("ftcGoalFlag")}</div><svg viewBox="0 0 300 130" aria-hidden="true"><path d="M62 100 C100 100 126 84 152 65 S210 38 247 38" /></svg><div className="tiny-robot">↑<b>{t("ftcBot")}</b></div></div>
            <div className="preview-run"><span><i /> {t("ftcReadySimulate")}</span><strong>▶ {t("ftcRunMission")}</strong></div>
          </div>
        </div>
      </section>

      <section className="what-is-this">
        <div><span className="section-number">{t("ftcWhatIsIt")}</span><h2>{t("ftcFlightSimulator")}</h2></div>
        <div className="definition-grid">
          <p><b>{t("ftcCode")}</b><span>{t("ftcCodeDefinition")}</span></p>
          <p><b>{t("ftcSimulation")}</b><span>{t("ftcSimulationDefinition")}</span></p>
          <p><b>{t("ftcTelemetry")}</b><span>{t("ftcTelemetryDefinition")}</span></p>
        </div>
      </section>

      <section id="paths" className="level-section">
        <div className="section-heading"><div><span className="section-number">{t("ftcChoosePath")}</span><h2>{t("ftcStartWhere")}</h2></div><p>{t("ftcPathsLead")}</p></div>
        <div className="level-grid">
          {paths.map((path) => (
            <article className={`level-card ${path.accent}`} key={path.level}>
              <div className="level-top"><span>{path.level}</span><b>{path.tag}</b></div>
              <h3>{path.title}</h3><p>{path.description}</p>
              <div className="level-outcome"><small>{t("ftcYouLearn")}</small><strong>{path.outcome}</strong></div>
              <Link href={path.href}>{path.cta} <span>→</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="new-workflow">
        <div className="section-heading"><div><span className="section-number">{t("ftcHowWorks")}</span><h2>{t("ftcOneLoop")}</h2></div><p>{t("ftcLoopLead")}</p></div>
        <div className="loop-grid">{loop.map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
      </section>

      <section className="first-step">
        <div><span className="eyebrow">{t("ftcFirstWin")}</span><h2>{t("ftcFirstWinTitle")}</h2><p>{t("ftcFirstWinText")}</p></div>
        <Link href="/ftc/simulator?level=beginner" className="button button-primary">{t("ftcStartBeginner")} <span>→</span></Link>
      </section>
    </main>
  );
}
