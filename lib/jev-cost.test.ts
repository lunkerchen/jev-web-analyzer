import { describe, expect, it } from "vitest";
import { formatUsd, jevCostUsd } from "./jev-cost";

describe("jevCostUsd", () => {
  it("bills input tokens at the list price", () => {
    expect(jevCostUsd(1_000_000)).toBeCloseTo(0.042);
    expect(formatUsd(jevCostUsd(6093)!)).toBe("US$0.00026");
  });
  it("returns undefined without usage", () => {
    expect(jevCostUsd(undefined)).toBeUndefined();
  });
  it("formats tiny and zero amounts without scientific notation", () => {
    expect(formatUsd(0)).toBe("US$0");
    expect(formatUsd(jevCostUsd(1)!)).toBe("US$0.000000042");
  });
});
