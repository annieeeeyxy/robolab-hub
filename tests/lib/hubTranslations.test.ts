import { describe, expect, it } from "vitest";
import { getHubTranslation } from "../../src/lib/hubTranslations";

describe("Hub translations", () => {
  it("provides Hub navigation in every supported language", () => {
    expect(getHubTranslation("en", "hubPromptCta")).toBe("Open RoboPrompt");
    expect(getHubTranslation("es", "hubPromptCta")).toBe("Abrir RoboPrompt");
    expect(getHubTranslation("fr", "hubPromptCta")).toBe("Ouvrir RoboPrompt");
    expect(getHubTranslation("zh", "hubPromptCta")).toBe("打开 RoboPrompt");
  });

  it("returns undefined for keys outside the Hub dictionary", () => {
    expect(getHubTranslation("en", "notARealKey")).toBeUndefined();
  });
});
