import { describe, expect, it } from "vitest";
import { answersForSection, founderSynthesis, FOUNDER_SECTIONS, splitCtaSignal } from "./founder-summary";

describe("founder summary helpers", () => {
  it("summarizes only returned founder labels", () => {
    expect(founderSynthesis([
      { name: "audience", type: "choice", value: "developers" },
      { name: "differentiation", type: "choice", value: "strong" },
    ])).toBe("Jev 判斷此站目標客群為開發者、差異化強。");
    expect(founderSynthesis([])).toBe("");
  });

  it("splits the encoded CTA without changing the returned key", () => {
    expect(splitCtaSignal("somewhat_get_api_key")).toEqual({ clarity: "還算明確", action: "取得 API 金鑰" });
    expect(splitCtaSignal("unclear_none_detected")).toEqual({ clarity: "不明確", action: "未偵測到" });
  });

  it("keeps founder sections bounded and omits missing answers", () => {
    expect(FOUNDER_SECTIONS).toHaveLength(3);
    expect(answersForSection([{ name: "audience", type: "choice", value: "business" }], ["audience", "value_proposition_clarity"])).toHaveLength(1);
  });
});
