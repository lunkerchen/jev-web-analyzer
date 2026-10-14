"use client";

import { useEffect, useState } from "react";
import { Check, Circle, LoaderCircle, X } from "lucide-react";
import type { TraceState } from "@/lib/analysis-trace";
import { formatUsd, jevCostUsd } from "@/lib/jev-cost";

const stages = [
  { key: "fetch", title: "用 ReplyNodes 擷取網頁" },
  { key: "extract", title: "擷取乾淨的 Markdown" },
  { key: "context", title: "為 Jev 準備上下文" },
  { key: "jev", title: "用 Jev 執行 10 項創辦人判斷" },
  { key: "result", title: "產生分析結果" },
] as const;
type StageKey = (typeof stages)[number]["key"];

function stageStatus(stage: StageKey, trace: TraceState): "pending" | "running" | "complete" | "failed" {
  if (trace.status === "failed") return trace.completedStages?.includes(stage) ? "complete" : trace.activeStage === stage ? "failed" : "pending";
  if (trace.completedStages?.includes(stage)) return "complete";
  if (trace.activeStage === stage) return "running";
  return "pending";
}

export function Trace({ trace }: { trace: TraceState }) {
  const [expanded, setExpanded] = useState(trace.status !== "complete");
  useEffect(() => { if (trace.status === "complete") setExpanded(false); }, [trace.status]);
  return (
    <section className="mt-8" aria-live="polite" aria-label="分析進度">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">執行紀錄</h2>
        {trace.status === "complete" && (
          <button type="button" className="min-h-11 px-2 text-xs underline underline-offset-4" onClick={() => setExpanded(!expanded)}>
            {expanded ? "收合" : "展開"}
          </button>
        )}
      </div>
      {expanded ? (
        <div className="rounded-xl border bg-card p-4">
          {stages.map(({ key, title }) => {
            const status = stageStatus(key, trace);
            return (
              <div key={key} className="flex gap-3 py-2">
                <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${status === "complete" ? "bg-emerald-500/15 text-emerald-600" : status === "failed" ? "bg-destructive/15 text-destructive" : status === "running" ? "bg-foreground/10 text-foreground motion-safe:animate-pulse" : "bg-muted text-muted-foreground"}`}>
                  {status === "complete" ? <Check className="size-3" /> : status === "failed" ? <X className="size-3" /> : status === "running" ? <LoaderCircle className="size-3 motion-safe:animate-spin" /> : <Circle className="size-2 fill-current" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{title}</p>
                  {key === "fetch" && trace.metrics.scrapeMs !== undefined && <p className="font-mono text-xs text-muted-foreground">{trace.metrics.scrapeMs} ms · HTTP {trace.metrics.status ?? "未知"}</p>}
                  {key === "context" && trace.metrics.characters !== undefined && <p className="font-mono text-xs text-muted-foreground">{trace.metrics.characters.toLocaleString()} 個字元已備妥</p>}
                  {key === "jev" && trace.metrics.jevMs !== undefined && <p className="font-mono text-xs text-muted-foreground">{trace.metrics.jevMs} ms{trace.metrics.inputTokens !== undefined ? ` · ${trace.metrics.inputTokens.toLocaleString()} 個輸入 token` : ""}{trace.metrics.inputTokens !== undefined ? ` · 約 ${formatUsd(jevCostUsd(trace.metrics.inputTokens)!)}` : ""}{trace.metrics.outputTokens !== undefined ? ` · ${trace.metrics.outputTokens.toLocaleString()} 個輸出 token` : ""}</p>}
                  {key === "result" && trace.result && <p className="font-mono text-xs text-muted-foreground">{trace.result.timeline.totalMs} ms</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        trace.result && <div className="rounded-xl border p-3 font-mono text-xs text-muted-foreground">完成 · 共 {trace.result.timeline.totalMs} ms</div>
      )}
    </section>
  );
}
