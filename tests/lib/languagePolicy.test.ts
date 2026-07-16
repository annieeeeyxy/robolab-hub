import { describe, expect, it } from "vitest";
import {
  buildLanguagePolicyInstruction,
  resolveResponseLanguage,
  shouldMirrorMixedStyle,
} from "../../src/lib/languagePolicy";

describe("shared language policy", () => {
  it("uses the Hub selection when the user text is absent or ambiguous", () => {
    expect(resolveResponseLanguage("fr")).toBe("fr");
    expect(resolveResponseLanguage("zh", "ROS2 CAN bus")).toBe("zh");
  });

  it("matches a clearly detected single-language user message", () => {
    expect(resolveResponseLanguage("en", "Hola, puedes ayudar con el brazo robotico")).toBe("es");
    expect(resolveResponseLanguage("en", "Bonjour, pouvez-vous aider avec le bras robotique ?")).toBe("fr");
    expect(resolveResponseLanguage("en", "请帮我分析这个机械臂")).toBe("zh");
  });

  it("keeps the selected language for mixed-language messages", () => {
    const mixed = "Hola, puedes ayudar con这个机械臂吗？";
    expect(shouldMirrorMixedStyle(mixed)).toBe(true);
    expect(resolveResponseLanguage("fr", mixed)).toBe("fr");
  });

  it("describes the selected response language in the model instruction", () => {
    expect(buildLanguagePolicyInstruction("es", "es")).toContain("respond in: Spanish");
  });
});
