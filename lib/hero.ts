import type { AnalysisResponse } from "./contracts";

type Classification = AnalysisResponse["classifications"][number];

export const HERO_SIGNAL_NAMES = ["audience", "strongest_reason_to_choose", "self_serve_motion"] as const;

export type HeroSignalName = (typeof HERO_SIGNAL_NAMES)[number];

export const HERO_SIGNAL_LABELS: Record<HeroSignalName, string> = {
  audience: "目標客群",
  strongest_reason_to_choose: "選擇理由",
  self_serve_motion: "成交模式",
};

export type HeroSignal = {
  name: HeroSignalName;
  label: string;
  classification?: Classification;
};

const H1 = /^#\s+/;

/**
 * First Markdown H1, verbatim. Returns null when the homepage has no H1 so the
 * hero omits the quote instead of inventing one (R2).
 */
export function extractHeroHeading(markdownPreview: string): string | null {
  if (!markdownPreview) return null;
  const line = markdownPreview.split("\n").find((candidate) => H1.test(candidate));
  if (!line) return null;
  const heading = line.replace(H1, "").trim();
  return heading || null;
}

export function heroSignals(classifications: Classification[]): HeroSignal[] {
  return HERO_SIGNAL_NAMES.map((name) => ({
    name,
    label: HERO_SIGNAL_LABELS[name],
    classification: classifications.find((classification) => classification.name === name),
  }));
}
