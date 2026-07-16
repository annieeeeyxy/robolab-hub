import { useState } from "react";
import { AIFeedback } from "@/lib/ftc/types";
import { useTranslation } from "@/hooks/useTranslation";

export function AIFeedbackPanel({ data, goal }: { data: AIFeedback | null; goal: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState<"up" | "down" | null>(null);

  if (!data) {
    return (
      <section className="ai-panel panel ai-empty">
        <div className="ai-orb">*</div>
        <span className="kicker">{t("ftcAiMentor")}</span>
        <h2>{t("ftcReadyWhen")}</h2>
        <p>{t("ftcAiEmptyHelp")}</p>
      </section>
    );
  }

  const report = `ROBOLAB FTC SIMULATION REPORT
Goal: ${goal}

${data.headline}

WHAT HAPPENED
${data.happened}

LIKELY CAUSE
${data.cause}

EVIDENCE
- ${data.evidence.join("\n- ")}

SUGGESTED FIX
${data.fix}

OPTIMIZATION
${data.optimization}`;

  const copy = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="ai-panel panel">
      <div className="panel-head">
        <div>
          <span className="kicker">{t("ftcAiMentor")}</span>
          <h2>{data.headline}</h2>
        </div>
        <span className={`analysis-status ${data.status}`}>{data.status === "warning" ? t("ftcActionNeeded") : t("ftcAnalysisReady")}</span>
      </div>
      <div className="feedback-lead"><span>{t("ftcWhatHappened")}</span><p>{data.happened}</p></div>
      <div className="feedback-grid">
        <article><span>{t("ftcLikelyCause")}</span><p>{data.cause}</p></article>
        <article className="evidence"><span>{t("ftcEvidence")}</span><ul>{data.evidence.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article className="fix"><span>{t("ftcSuggestedFix")}</span><p>{data.fix}</p></article>
        <article><span>{t("ftcOptimization")}</span><p>{data.optimization}</p></article>
      </div>
      <div className="concept"><b>{t("ftcConcept")}</b><p>{data.concept}</p></div>
      <div className="report-tools">
        <button onClick={copy}>{copied ? t("ftcReportCopied") : t("ftcCopyReport")}</button>
        <div>
          <span>{t("ftcFeedbackHelpful")}</span>
          <button className={rating === "up" ? "selected" : ""} onClick={() => setRating("up")}>{t("ftcUp")}</button>
          <button className={rating === "down" ? "selected" : ""} onClick={() => setRating("down")}>{t("ftcDown")}</button>
        </div>
      </div>
    </section>
  );
}
