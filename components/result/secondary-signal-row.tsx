import type { AnalysisResponse } from "@/lib/contracts";
import { SECONDARY_SIGNAL_NAMES } from "@/lib/signal-map";
import { ProvenanceTag } from "./provenance-tag";
import { SignalCard } from "./signal-card";

const LABELS: Record<string, string> = {
  audience: "目標客群",
  strongest_reason_to_choose: "選擇理由",
  self_serve_motion: "成交模式",
};

export function SecondarySignalRow({ classifications }: { classifications: AnalysisResponse["classifications"] }) {
  const slots = SECONDARY_SIGNAL_NAMES.flatMap((name) => {
    const classification = classifications.find((item) => item.name === name);
    return classification ? [{ name, classification }] : [];
  });
  if (!slots.length) return null;
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {slots.map((slot) => (
        <SignalCard key={slot.name} classification={slot.classification} label={LABELS[slot.name]} />
      ))}
    </div>
  );
}

export function SecondarySignalHeading() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold">輔助訊號</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          目標客群、選擇理由與成交模式僅供參考，不附帶好壞評價。
        </p>
      </div>
      <ProvenanceTag kind="jev" />
    </div>
  );
}
