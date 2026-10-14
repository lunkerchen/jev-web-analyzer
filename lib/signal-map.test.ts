import { describe, expect, it } from "vitest";
import { DEFAULT_QUESTIONS } from "./founder-questions";
import {
  hasStatusChip,
  humanize,
  isActionable,
  isNegativeValue,
  isNonActionable,
  labelFor,
  statusFor,
  statusForDisplay,
  valueLabel,
  type SignalStatus,
} from "./signal-map";

const VALID: SignalStatus[] = ["supported", "partial", "weak", "insufficient"];

describe("signal-map status mapping", () => {
  it("maps every enum value declared in founder-questions.ts", () => {
    for (const [name, definition] of Object.entries(DEFAULT_QUESTIONS)) {
      for (const value of Object.keys(definition.criteria)) {
        expect(VALID, `${name}.${value}`).toContain(statusFor(name, value));
      }
    }
  });

  it("does not silently fall through for an unknown signal", () => {
    expect(() => statusFor("made_up_signal", "yes")).toThrow(/Unknown signal/);
  });

  it("does not silently fall through for an unknown enum value", () => {
    expect(() => statusFor("differentiation", "amazing")).toThrow(/Unknown value/);
  });

  it("surfaces an unknown enum as a neutral partial chip in the UI", () => {
    expect(statusForDisplay("differentiation", "amazing")).toBe("partial");
    expect(statusForDisplay("differentiation", "strong")).toBe("supported");
  });

  it("never attaches a status chip to informational signals or change_first", () => {
    expect(hasStatusChip("differentiation")).toBe(true);
    expect(hasStatusChip("understandable_in_10_seconds")).toBe(true);
    expect(hasStatusChip("audience")).toBe(false);
    expect(hasStatusChip("strongest_reason_to_choose")).toBe(false);
    expect(hasStatusChip("self_serve_motion")).toBe(false);
    expect(hasStatusChip("change_first")).toBe(false);
  });

  it("classifies non-actionable and negative values", () => {
    for (const value of ["other", "no_clear_reason", "not_apparent", "none_apparent", "unclear_other", "unclear_none_detected"]) {
      expect(isNonActionable(value), value).toBe(true);
      expect(isActionable(value), value).toBe(false);
    }
    for (const value of ["weak", "mostly_generic", "unclear", "not_apparent", "none_apparent"]) {
      expect(isNegativeValue(value), value).toBe(true);
    }
    expect(isActionable("strong")).toBe(true);
    expect(isNegativeValue("other")).toBe(false);
  });

  it("humanizes enum values for display", () => {
    expect(humanize("lead_with_customer_outcome")).toBe("Lead with customer outcome");
    expect(humanize("mostly_self_serve")).toBe("Mostly self serve");
    expect(humanize("clear_get_api_key")).toBe("Clear get API key");
  });

  it("falls back to a humanized label for unknown signals", () => {
    expect(labelFor("understandable_in_10_seconds")).toBe("10 秒內看得懂");
    expect(labelFor("custom_thing")).toBe("Custom thing");
  });

  it("translates enum values to Traditional Chinese", () => {
    expect(valueLabel("smbs")).toBe("中小企業");
    expect(valueLabel("strongly_sales_led")).toBe("明顯靠業務成交");
    expect(valueLabel("add_customer_proof")).toBe("加上客戶證據");
    expect(valueLabel("clear_get_api_key")).toBe("明確・取得 API 金鑰");
    expect(valueLabel("unclear_none_detected")).toBe("不明確・未偵測到");
    expect(valueLabel("brand_new_value")).toBe("Brand new value");
  });

  it("translates every declared enum value", () => {
    for (const [name, definition] of Object.entries(DEFAULT_QUESTIONS)) {
      for (const value of Object.keys(definition.criteria)) {
        expect(valueLabel(value), `${name}.${value}`).toMatch(/[\u4e00-\u9fff]/);
      }
    }
  });
});
