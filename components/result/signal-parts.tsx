import type { AnalysisResponse } from "@/lib/contracts";
import { isLowConfidence } from "@/lib/confidence";
import { signalConclusion, sortedProbabilities } from "@/lib/probabilities";
import { valueLabel, type SignalStatus } from "@/lib/signal-map";
import { cn } from "@/lib/utils";

export type Classification = AnalysisResponse["classifications"][number];

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function ConfidenceBadge({ confidence }: { confidence?: number }) {
  if (typeof confidence !== "number") {
    return (
      <span className="whitespace-nowrap rounded-full border border-border bg-muted px-2 py-1 text-[11px] font-bold text-muted-foreground">
        未回傳信心度
      </span>
    );
  }
  const low = isLowConfidence(confidence);
  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-full border px-2 py-1 text-[11px] font-bold",
        low
          ? "border-[#eccb92] bg-[#fdf3e3] text-[#b45309] dark:border-[#6b4d1c] dark:bg-[#3a2a10] dark:text-[#fbbf24]"
          : "border-border bg-muted text-foreground",
      )}
    >
      信心度 {percent(confidence)}{low ? " · 偏低" : ""}
    </span>
  );
}

const STATUS_LABEL: Record<SignalStatus, string> = {
  supported: "有支持",
  partial: "部分支持",
  weak: "偏弱",
  insufficient: "無法判斷",
};

const STATUS_STYLE: Record<SignalStatus, string> = {
  supported: "border-[#b6e2c4] bg-[#e7f6ec] text-[#15803d] dark:border-[#1f5a3a] dark:bg-[#0f2e1d] dark:text-[#6ee7a8]",
  partial: "border-[#eccb92] bg-[#fdf3e3] text-[#b45309] dark:border-[#6b4d1c] dark:bg-[#3a2a10] dark:text-[#fbbf24]",
  weak: "border-[#f0b9b9] bg-[#fdecec] text-[#b91c1c] dark:border-[#6b2b2b] dark:bg-[#3a1616] dark:text-[#fca5a5]",
  insufficient: "border-dashed border-border bg-muted text-muted-foreground",
};

export function StatusChip({ status }: { status: SignalStatus }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[12px] font-bold", STATUS_STYLE[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/**
 * Always states the value Jev actually returned, labelled as Jev's, with its
 * own probability. A close call adds the highest non-returned alternative; a
 * non-actionable top-1 becomes an inability statement that still discloses the
 * raw returned value (R6, R7).
 */
export function ConclusionBlock({ classification }: { classification: Classification }) {
  const value = String(classification.value);
  const conclusion = signalConclusion(value, classification.probabilities);

  if (conclusion.kind === "undetermined") {
    return (
      <div>
        <p className="text-sm font-semibold text-muted-foreground">Jev 無法從首頁判斷這一項</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Jev 回傳的值：{" "}
          <b className="font-mono text-foreground">
            {valueLabel(conclusion.returnedValue)}
            {conclusion.probability === undefined ? "" : ` ${percent(conclusion.probability)}`}
          </b>{" "}
          · 無法據以行動
        </p>
        {conclusion.nextActionable ? (
          <p className="mt-1 text-xs text-muted-foreground">
            下一個可行動的選項：{" "}
            <b className="text-foreground">
              {valueLabel(conclusion.nextActionable.value)} {percent(conclusion.nextActionable.probability)}
            </b>
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">沒有回傳可行動的選項。</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-xl font-extrabold tracking-tight">
        Jev 的選擇：{" "}
        <b>
          {valueLabel(conclusion.value)}
          {conclusion.probability === undefined ? "" : ` ${percent(conclusion.probability)}`}
        </b>
      </p>
      {conclusion.closeCall && conclusion.closeAlternative ? (
        <p className="mt-1 text-sm font-bold">
          差距很小：{" "}
          <b>
            {valueLabel(conclusion.closeAlternative.value)} {percent(conclusion.closeAlternative.probability)}
          </b>
        </p>
      ) : null}
    </div>
  );
}

export function DistributionDisclosure({ probabilities }: { probabilities?: Record<string, number> }) {
  const rows = sortedProbabilities(probabilities);
  return (
    <details className="mt-4 border-t pt-3">
      <summary className="min-h-9 cursor-pointer list-none text-xs font-extrabold text-[#5b4bc4] marker:content-none dark:text-[#b3a5ff]">
        查看 Jev 的機率分布
      </summary>
      {rows.length ? (
        <div className="mt-2 grid gap-1.5">
          {rows.map((row) => (
            <div key={row.value} className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="truncate">{valueLabel(row.value)}</span>
              <b className="font-mono tabular-nums text-foreground">{percent(row.probability)}</b>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">沒有回傳機率分布。</p>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">
        原始機率 · 共 {rows.length} 個選項
      </p>
    </details>
  );
}
