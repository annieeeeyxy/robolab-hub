import { useMemo, useState } from "react";
import { CoordinateSystem, TelemetryFrame } from "@/lib/ftc/types";
import { useTranslation } from "@/hooks/useTranslation";

type TelemetryItemId = "position" | "heading" | "drivePower" | "encoders" | "progress" | "launcher" | "arm" | "intake" | "events";

type TelemetryOption = {
  id: TelemetryItemId;
  labelKey: string;
  descriptionKey: string;
};

const telemetryOptions: TelemetryOption[] = [
  { id: "position", labelKey: "ftcPosition", descriptionKey: "ftcPositionDescription" },
  { id: "heading", labelKey: "ftcHeading", descriptionKey: "ftcHeadingDescription" },
  { id: "drivePower", labelKey: "ftcDrivePower", descriptionKey: "ftcDrivePowerDescription" },
  { id: "encoders", labelKey: "ftcEncoders", descriptionKey: "ftcEncodersDescription" },
  { id: "progress", labelKey: "ftcRunProgress", descriptionKey: "ftcRunProgressDescription" },
  { id: "launcher", labelKey: "ftcLauncher", descriptionKey: "ftcLauncherDescription" },
  { id: "arm", labelKey: "ftcArm", descriptionKey: "ftcArmDescription" },
  { id: "intake", labelKey: "ftcIntake", descriptionKey: "ftcIntakeDescription" },
  { id: "events", labelKey: "ftcEvents", descriptionKey: "ftcEventsDescription" },
];

type Translate = (key: string, values?: Record<string, string | number>) => string;

function localizeTelemetryMessage(message: string | undefined, t: Translate) {
  if (!message) return "";
  const exactMessages: Record<string, string> = {
    Ready: t("ftcReadyEvent"),
    "Objects settled": t("ftcObjectsSettled"),
    "No supported robot code actions parsed": t("ftcNoActionsParsed"),
    "No artifact loaded to shoot": t("ftcNoArtifactLoaded"),
    "controlled 4 artifacts": t("ftcControlledFourArtifacts"),
    "Invalid start position": t("ftcInvalidStartPosition"),
  };
  if (exactMessages[message]) return exactMessages[message];

  const collected = message.match(/^(.*); collected artifact (\d+)$/);
  if (collected) {
    return `${collected[1]}; ${t("ftcCollectedArtifact", { count: collected[2] })}`;
  }
  const controlled = message.match(/^(.*); controlled 4 artifacts$/);
  if (controlled) {
    return `${controlled[1]}; ${t("ftcControlledFourArtifacts")}`;
  }
  return message;
}

function Metric({
  label,
  value,
  detail,
  accent,
  removeAria,
  onRemove,
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: string;
  removeAria: string;
  onRemove: () => void;
}) {
  return (
    <div className="metric telemetry-item">
      <button type="button" className="telemetry-remove" aria-label={removeAria} onClick={onRemove}>x</button>
      <span>{label}</span>
      <strong className={accent}>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

function EventsSection({ events, onRemove }: { events: TelemetryFrame[]; onRemove: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="event-section telemetry-item telemetry-events">
      <button type="button" className="telemetry-remove" aria-label={t("ftcRemoveTelemetry", { label: t("ftcEvents") })} onClick={onRemove}>x</button>
      <div className="event-title"><span>{t("ftcEvents")}</span><b>{events.length}</b></div>
      <div className="event-log">
        {events.length ? events.slice(-4).reverse().map((event, index) => (
          <div key={`${event.time}-${index}`} className={event.warning ? "warning-event" : "normal-event"}>
            <time>{event.time.toFixed(2)}s</time>
            <i>{event.warning ? "!" : "*"}</i>
            <span>{localizeTelemetryMessage(event.warning || event.event, t)}</span>
          </div>
        )) : <div className="empty-event">{t("ftcEventsEmpty")}</div>}
      </div>
    </div>
  );
}

function displayPosition(frame: TelemetryFrame, coordinateSystem: CoordinateSystem) {
  if (coordinateSystem === "center") {
    return {
      x: frame.x - 72,
      y: 72 - frame.y,
    };
  }

  return {
    x: frame.x,
    y: 144 - frame.y,
  };
}

export function TelemetryPanel({ frame, events, progress, coordinateSystem }: { frame: TelemetryFrame; events: TelemetryFrame[]; progress: number; coordinateSystem: CoordinateSystem }) {
  const { t } = useTranslation();
  const [selectedTelemetry, setSelectedTelemetry] = useState<TelemetryItemId[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const position = displayPosition(frame, coordinateSystem);

  const availableTelemetry = useMemo(
    () => telemetryOptions.filter((option) => !selectedTelemetry.includes(option.id)),
    [selectedTelemetry],
  );

  const removeTelemetry = (id: TelemetryItemId) => {
    setSelectedTelemetry((current) => current.filter((item) => item !== id));
  };

  const addTelemetry = (id: TelemetryItemId) => {
    setSelectedTelemetry((current) => [...current, id]);
    setShowAddMenu(false);
  };

  const renderTelemetry = (id: TelemetryItemId) => {
    if (id === "events") return <EventsSection key={id} events={events} onRemove={() => removeTelemetry(id)} />;

    const props = {
      position: {
        label: t("ftcPosition"),
        value: `${position.x.toFixed(1)}, ${position.y.toFixed(1)}`,
        detail: coordinateSystem === "center" ? t("ftcCenterPositionDetail") : t("ftcCornerPositionDetail"),
      },
      heading: {
        label: t("ftcHeading"),
        value: `${frame.heading.toFixed(1)} deg`,
        detail: t("ftcFieldRelative"),
        accent: Math.abs(frame.heading) > 8 ? "warn" : "",
      },
      drivePower: {
        label: t("ftcDrivePower"),
        value: `${frame.leftPower.toFixed(2)} / ${frame.rightPower.toFixed(2)}`,
        detail: t("ftcLeftRight"),
      },
      encoders: {
        label: t("ftcEncoders"),
        value: `${Math.round(frame.leftEncoder)} / ${Math.round(frame.rightEncoder)}`,
        detail: t("ftcLeftRightTicks"),
      },
      progress: {
        label: t("ftcRunProgress"),
        value: `${Math.round(progress)}%`,
        detail: t("ftcSimulationCompletion"),
      },
      launcher: {
        label: t("ftcLauncher"),
        value: frame.shooterTarget > 0 ? `${Math.round(frame.shooterRpm).toLocaleString()} RPM` : t("ftcIdle"),
        detail: frame.shooterTarget > 0 ? t("ftcTargetRpm", { value: frame.shooterTarget.toLocaleString() }) : t("ftcNoTargetSet"),
        accent: frame.feeder && frame.shooterRpm < frame.shooterTarget * 0.95 ? "warn" : "",
      },
      arm: {
        label: t("ftcArm"),
        value: frame.armTarget > 0 ? t("ftcTicks", { value: Math.round(frame.armPosition).toLocaleString() }) : t("ftcIdle"),
        detail: frame.armTarget > 0 ? t("ftcTargetTicks", { value: frame.armTarget.toLocaleString() }) : t("ftcNoTargetSet"),
        accent: frame.armPosition > 1400 ? "warn" : "",
      },
      intake: {
        label: t("ftcIntake"),
        value: frame.intake === "in" ? t("ftcCollecting") : frame.intake === "out" ? t("ftcReversed") : t("ftcOff"),
        detail: t("ftcArtifactsStored", { count: frame.artifactCount }),
        accent: frame.intake === "out" ? "warn" : "",
      },
    }[id];

    return <Metric key={id} {...props} removeAria={t("ftcRemoveTelemetry", { label: props.label })} onRemove={() => removeTelemetry(id)} />;
  };

  return (
    <section className="telemetry panel clean-telemetry">
      <div className="tool-panel-head"><div><h2>{t("ftcTelemetry")}</h2><p>{t("ftcLiveRobotData")}</p></div><span className="timecode">{frame.time.toFixed(2)} s</span></div>
      <div className="timeline"><span style={{ width: `${progress}%` }} /><i style={{ left: `${progress}%` }} /></div>
      <div className="telemetry-section-stack">
        {selectedTelemetry.map(renderTelemetry)}
        <div className="telemetry-add">
          <button type="button" className="telemetry-add-button" onClick={() => setShowAddMenu((open) => !open)}>
            + {t("ftcAddTelemetry")}
          </button>
          {showAddMenu && (
            <div className="telemetry-add-menu">
              {availableTelemetry.length ? availableTelemetry.map((option) => (
                <button key={option.id} type="button" onClick={() => addTelemetry(option.id)}>
                  <span>{t(option.labelKey)}</span>
                  <small>{t(option.descriptionKey)}</small>
                </button>
              )) : <p>{t("ftcAllTelemetry")}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
