import type { TraceState } from "@/lib/analysis-trace";
import type { AnalysisResponse } from "@/lib/contracts";
import { formatUsd, jevCostUsd } from "@/lib/jev-cost";
import { ProvenanceTag } from "./provenance-tag";

function cell(value: string | number | undefined, format?: (value: number) => string) {
  if (value === undefined || value === "") return "未回傳";
  if (typeof value === "number") return format ? format(value) : value.toLocaleString();
  return value;
}

export function RunEvidence({ result, trace }: { result?: AnalysisResponse; trace: TraceState }) {
  const metrics = trace.metrics;
  const rows: Array<[string, string]> = [
    ["要求的模型", cell(result?.model.requested)],
    ["實際版本", "未揭露"],
    ["來源", "首頁 Markdown"],
    ["字元數", cell(result?.usage.characters ?? metrics.characters)],
    ["分析頁數", "1"],
    ["分析時間", cell(result?.timeline.totalMs ?? metrics.totalMs, (value) => `${value} ms`)],
    ["擷取狀態", cell(result?.timeline.fetchStatus ?? metrics.status, (value) => `HTTP ${value}`)],
    ["輸入 token 數", cell(result?.usage.inputTokens ?? metrics.inputTokens)],
    ["輸出 token 數", cell(result?.usage.outputTokens ?? metrics.outputTokens)],
    ["Jev 成本（估算）", cell(jevCostUsd(result?.usage.inputTokens ?? metrics.inputTokens), formatUsd)],
    ["請求 ID", cell(result?.scrape.requestId)],
  ];

  const scrapeMs = result?.timeline.scrapeMs ?? metrics.scrapeMs;
  const jevMs = result?.timeline.jevMs ?? metrics.jevMs;
  const characters = result?.usage.characters ?? metrics.characters;
  const count = result?.classifications.length;

  const steps: Array<[string, string]> = [
    ["首頁", scrapeMs === undefined ? "已擷取" : `擷取 ${scrapeMs} ms`],
    ["Markdown", characters === undefined ? "已轉換" : `${characters.toLocaleString()} 字元`],
    ["Jev", jevMs === undefined ? "已分類" : `${jevMs} ms`],
    ["分類結果", count === undefined ? "處理中" : `${count} 項訊號`],
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-card px-4 py-3">
            <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
              {label} · 執行
            </span>
            <strong className="break-words font-mono text-[13px] font-semibold">{value}</strong>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ProvenanceTag kind="run" />
        {steps.map(([label, detail], index) => (
          <div key={label} className="flex items-center gap-2">
            {index > 0 ? <span className="text-muted-foreground">→</span> : null}
            <span className="rounded-lg border bg-card px-3 py-2 text-xs">
              <b className="block text-[13px]">{label}</b>
              <span className="text-[11px] text-muted-foreground">{detail}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
