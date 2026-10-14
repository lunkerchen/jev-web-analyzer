// ponytail: hard-coded list price from https://docs.typesafe.ai/models (checked 2026-10-14).
// Input tokens only; output tokens are free. Update here if TypeSafe changes pricing.
export const JEV_USD_PER_MILLION_INPUT_TOKENS = 0.042;

export function jevCostUsd(inputTokens: number | undefined): number | undefined {
  return inputTokens === undefined ? undefined : (inputTokens / 1_000_000) * JEV_USD_PER_MILLION_INPUT_TOKENS;
}

export function formatUsd(usd: number): string {
  return `US$${usd.toLocaleString("en-US", { maximumSignificantDigits: 2 })}`;
}
