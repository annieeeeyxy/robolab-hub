import { describe, expect, it } from "vitest";
import { normalizeInternalRedirect } from "../../src/lib/redirect";

describe("normalizeInternalRedirect", () => {
  it("accepts internal absolute paths", () => {
    expect(normalizeInternalRedirect("/roboprompt/try?lang=en")).toBe("/roboprompt/try?lang=en");
  });

  it("rejects external URLs", () => {
    expect(normalizeInternalRedirect("https://evil.example/phish")).toBe("/roboprompt/try");
  });

  it("rejects protocol-relative URLs", () => {
    expect(normalizeInternalRedirect("//evil.example/phish")).toBe("/roboprompt/try");
  });

  it("rejects malformed values", () => {
    expect(normalizeInternalRedirect("/\\evil")).toBe("/roboprompt/try");
    expect(normalizeInternalRedirect("/safe\nunsafe")).toBe("/roboprompt/try");
  });
});
