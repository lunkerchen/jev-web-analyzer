import { aggregateConfidence, isLowConfidence } from "@/lib/confidence";
import type { AnalysisResponse } from "@/lib/contracts";
import { extractEvidence } from "@/lib/evidence";
import { extractHeroHeading, heroSignals, type HeroSignal } from "@/lib/hero";
import { cn } from "@/lib/utils";
import { ProvenanceTag } from "./provenance-tag";
import { ConclusionBlock, ConfidenceBadge, percent } from "./signal-parts";

const EVIDENCE_LABEL: Record<string, string> = {
  "hero-heading": "首頁主標題",
  "first-paragraph": "第一段文字",
  "cta-line": "行動按鈕文字",
  "list-item": "清單項目",
};

function HeroSignalCard({ signal }: { signal: HeroSignal }) {
  const { classification, label } = signal;
  const low = classification ? isLowConfidence(classification.confidence) : false;
  return (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", low && "border-[#eccb92] dark:border-[#6b4d1c]")}>
      <div className="flex items-center justify-between gap-2">
        <ProvenanceTag kind="jev" />
        {classification ? <ConfidenceBadge confidence={classification.confidence} /> : null}
      </div>
      <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">{label}</p>
      {classification ? (
        <div className="mt-1">
          <ConclusionBlock classification={classification} />
        </div>
      ) : (
        <p className="mt-1 text-sm font-semibold text-muted-foreground">未回傳</p>
      )}
    </div>
  );
}

function EvidenceBlock({ markdownPreview }: { markdownPreview: string }) {
  const evidence = extractEvidence(markdownPreview);
  return (
    <div className="mt-6 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <ProvenanceTag kind="homepage" />
        <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
          Jev 讀到的內容
        </span>
      </div>
      {evidence.length ? (
        <ul className="mt-3 space-y-3">
          {evidence.map((entry) => (
            <li key={`${entry.kind}-${entry.text}`}>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                {EVIDENCE_LABEL[entry.kind]}
              </span>
              <blockquote className="mt-1 border-l-2 border-[#a9dcd2] pl-3 text-sm dark:border-[#1f5a51]">
                {entry.text}
              </blockquote>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm italic text-muted-foreground">沒有可引用的內容</p>
      )}
    </div>
  );
}

export function ThinContentBanner({ characters }: { characters: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#eccb92] bg-[#fdf3e3] px-4 py-3 text-sm font-bold text-[#b45309] dark:border-[#6b4d1c] dark:bg-[#3a2a10] dark:text-[#fbbf24]">
      <ProvenanceTag kind="run" />
      頁面內容偏少（{characters.toLocaleString()} 字元）—— 判讀依據可能不足。
    </div>
  );
}

export function FirstImpression({ result }: { result: AnalysisResponse }) {
  const heading = extractHeroHeading(result.scrape.markdownPreview);
  const signals = heroSignals(result.classifications);
  const aggregate = aggregateConfidence(result.classifications);

  return (
    <section>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-muted-foreground">
        Jev 讀到的首頁
      </p>

      <div className="mt-3">
        {heading ? (
          <figure className="mt-3 max-w-3xl rounded-xl border-l-2 border-[#a9dcd2] bg-muted/40 px-4 py-3 dark:border-[#1f5a51]">
            <figcaption className="flex flex-wrap items-center gap-2">
              <ProvenanceTag kind="homepage" />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                引自你的首頁
              </span>
            </figcaption>
            <blockquote className="mt-2">
              <p className="text-xl font-semibold leading-snug tracking-[-0.015em] text-foreground md:text-2xl">
                {heading}
              </p>
            </blockquote>
          </figure>
        ) : (
          <p className="text-sm text-muted-foreground">這個首頁沒有回傳 H1 · 省略引文。</p>
        )}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {signals.map((signal) => (
          <HeroSignalCard key={signal.name} signal={signal} />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card px-4 py-3">
          <ProvenanceTag kind="jev" />
          <span className="text-sm">
            {aggregate ? (
              <>
                <b>
                  信心度 {percent(aggregate.min)}–{percent(aggregate.max)} · 平均 {percent(aggregate.mean)}，共{" "}
                  {aggregate.count} 項訊號
                </b>
              </>
            ) : (
              <b>無信心度資料</b>
            )}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          彙整 Jev 對各項訊號回傳的信心度
        </span>
      </div>

      <EvidenceBlock markdownPreview={result.scrape.markdownPreview} />
    </section>
  );
}
