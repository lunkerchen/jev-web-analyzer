import { describe, expect, it } from "vitest";
import { ANALYSIS_CONTEXT_CAP, analysisContextLabel, prepareAnalysisContext } from "./analysis-context";

describe("analysis context", () => {
  it("sends the exact bounded state and reports the upstream size", () => {
    const markdown = "x".repeat(ANALYSIS_CONTEXT_CAP + 234);
    const context = prepareAnalysisContext(markdown);

    expect(context).toEqual({
      state: "x".repeat(ANALYSIS_CONTEXT_CAP),
      sentCharacters: ANALYSIS_CONTEXT_CAP,
      sourceCharacters: ANALYSIS_CONTEXT_CAP + 234,
      contextTruncated: true,
    });
    expect(analysisContextLabel(context)).toBe("顯示前 120,000 個字元（共擷取 120,234 個字元）");
  });

  it("does not report truncation below the cap", () => {
    const context = prepareAnalysisContext("clean markdown");

    expect(context.contextTruncated).toBe(false);
    expect(analysisContextLabel(context)).toBe("顯示全部 14 個擷取字元");
  });
});
