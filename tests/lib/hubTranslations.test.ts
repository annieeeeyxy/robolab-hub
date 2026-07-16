import { describe, expect, it } from "vitest";
import { getHubTranslation } from "../../src/lib/hubTranslations";

describe("Hub translations", () => {
  it("provides shared navigation and FTC controls in every supported language", () => {
    expect(getHubTranslation("en", "ftcAddTelemetry")).toBe("Add telemetry");
    expect(getHubTranslation("es", "ftcAddTelemetry")).toBe("Añadir telemetría");
    expect(getHubTranslation("fr", "ftcAddTelemetry")).toBe("Ajouter une télémétrie");
    expect(getHubTranslation("zh", "ftcAddTelemetry")).toBe("添加遥测");
  });

  it("localizes controls that are shared outside RoboPrompt", () => {
    expect(getHubTranslation("es", "loginTitle")).toBe("Introduce la contraseña");
    expect(getHubTranslation("fr", "ftcTimelineAria")).toBe("Chronologie de la simulation");
    expect(getHubTranslation("zh", "ftcRobotConfigurationMissing")).toBe("缺少机器人配置");
  });

  it("returns undefined for keys outside the Hub dictionary", () => {
    expect(getHubTranslation("en", "notARealKey")).toBeUndefined();
  });
});
