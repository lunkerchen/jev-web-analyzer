"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { ChangeFirstCard } from "@/components/result/change-first-card";
import { Feedback } from "@/components/result/feedback";
import { FailureRetry } from "@/components/result/failure-retry";
import { FirstImpression, ThinContentBanner } from "@/components/result/first-impression";
import { ResultHeaderStrip } from "@/components/result/header-strip";
import { ProvenanceTag } from "@/components/result/provenance-tag";
import { RunEvidence } from "@/components/result/run-evidence";
import { SecondarySignalHeading, SecondarySignalRow } from "@/components/result/secondary-signal-row";
import { SectionSkeleton } from "@/components/result/section-skeleton";
import { ShareRow } from "@/components/result/share-row";
import { CustomJudgments, SignalCard } from "@/components/result/signal-card";
import { SourcePanel } from "@/components/result/source-panel";
import { UnconfirmedSection } from "@/components/result/unconfirmed-section";
import { WhyBuild } from "@/components/result/why-build";
import { SiteHeader } from "@/components/site-header";
import { trackAnalysisCompleted, trackAnalysisStarted, trackDomainVisit } from "@/lib/analytics";
import type { TraceStage, TraceState } from "@/lib/analysis-trace";
import type { AnalysisResponse } from "@/lib/contracts";
import { useAnalysis } from "@/lib/hooks/use-analysis";
import { inputPath, safeInitialUrl, withAnalyzedUrl } from "@/lib/query-url";
import { readSessionJudgments } from "@/lib/session-judgments";
import { buildShareText } from "@/lib/share-card";
import { CHANGE_FIRST_SIGNAL, PRIMARY_SIGNAL_NAMES } from "@/lib/signal-map";

const THIN_CONTENT_THRESHOLD = 500;

const STAGE_LABEL: Record<TraceStage, string> = {
  fetch: "擷取首頁",
  extract: "轉換內容",
  context: "整理上下文",
  jev: "Jev 判讀中",
  result: "彙整結果",
};

function LoadingState({ trace }: { trace: TraceState }) {
  return (
    <div className="mt-8 space-y-6" aria-live="polite" aria-busy="true">
      <p className="text-xs text-muted-foreground">
        {trace.activeStage ? `正在讀取你的首頁 · ${STAGE_LABEL[trace.activeStage]}` : "正在讀取你的首頁…"}
      </p>
      <SectionSkeleton lines={2} />
      <div className="grid gap-3 md:grid-cols-3">
        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
      <RunEvidence trace={trace} />
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      <ProvenanceTag kind="jev" />
    </div>
  );
}

export function ResultPage() {
  const [status, setStatus] = useState<"checking" | "invalid" | "ready">("checking");
  const [requestedUrl, setRequestedUrl] = useState("");
  const { result, error, errorCode, trace, run, abort } = useAnalysis();
  const startedForRef = useRef<string | undefined>(undefined);
  const completedForRef = useRef<AnalysisResponse | undefined>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const safe = safeInitialUrl(params.get("url"));
    setRequestedUrl(safe);
    setStatus(safe ? "ready" : "invalid");
  }, []);

  useEffect(() => {
    if (status !== "ready" || !requestedUrl || startedForRef.current === requestedUrl) return;
    startedForRef.current = requestedUrl;
    const judgments = readSessionJudgments(requestedUrl);
    trackAnalysisStarted(requestedUrl, judgments.length);
    trackDomainVisit(requestedUrl);
    void run(requestedUrl, judgments).then((completed) => {
      if (completed?.url) window.history.replaceState(null, "", withAnalyzedUrl(window.location.href, completed.url));
    });
    return () => abort();
  }, [status, requestedUrl, run, abort]);

  useEffect(() => {
    if (!result || completedForRef.current === result) return;
    completedForRef.current = result;
    trackAnalysisCompleted(result);
  }, [result]);

  const retry = useCallback(() => {
    if (!requestedUrl) return;
    startedForRef.current = undefined;
    void run(requestedUrl, readSessionJudgments(requestedUrl));
  }, [requestedUrl, run]);

  const displayedUrl = result?.url ?? requestedUrl;
  const editHref = inputPath(displayedUrl || undefined);
  const primary = result
    ? PRIMARY_SIGNAL_NAMES.flatMap((name) => {
        const classification = result.classifications.find((item) => item.name === name);
        return classification ? [classification] : [];
      })
    : [];
  const changeFirst = result?.classifications.find((item) => item.name === CHANGE_FIRST_SIGNAL);
  const thinContent = result ? result.usage.characters < THIN_CONTENT_THRESHOLD : false;
  const shareText = result ? buildShareText(result) : "";
  const shareUrl = result ? withAnalyzedUrl(window.location.href, result.url) : "";

  return (
    <main className="min-h-screen overflow-x-hidden px-4 py-5 md:px-8">
      <SiteHeader crumb="jev 網站分析器 / 分析結果" />
      <section className="mx-auto max-w-6xl pb-16 pt-10 md:pt-14">
        <ResultHeaderStrip
          url={displayedUrl}
          startedAt={result?.timeline.startedAt}
          editHref={editHref}
          pending={status === "checking"}
        />

        {status === "invalid" && (
          <div
            role="alert"
            className="mt-6 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>沒有可分析的網址。請回上一頁，輸入公開的 SaaS 網址。</span>
          </div>
        )}

        {status === "ready" && result && (
          <div className="mt-8 animate-fade-in space-y-10">
            <FirstImpression result={result} />

            <section className="space-y-4">
              <SectionHeading
                title="Jev 看懂了什麼"
                description="Jev 回傳的選項與原始機率分布。每張卡片都標示自己的信心度與資料來源。"
              />
              {thinContent ? <ThinContentBanner characters={result.usage.characters} /> : null}
              <div className="grid gap-3 md:grid-cols-2">
                {primary.map((classification) => (
                  <SignalCard key={classification.name} classification={classification} />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <SecondarySignalHeading />
              <SecondarySignalRow classifications={result.classifications} />
            </section>

            <UnconfirmedSection classifications={result.classifications} />

            {changeFirst ? (
              <section className="space-y-4">
                <SectionHeading
                  title="Jev 建議先改什麼"
                  description="Jev 回傳的單一選項，附上原始機率分布與接近的次選項。不是長篇文字建議。"
                />
                <ChangeFirstCard classification={changeFirst} />
              </section>
            ) : null}

            <CustomJudgments judgments={result.judgments} />

            <section className="space-y-4">
              <SectionHeading
                title="執行細節"
                description="本次執行回傳的中繼資料。不宣稱實際使用的模型版本。"
              />
              <RunEvidence result={result} trace={trace} />
              <SourcePanel scrape={result.scrape} />
            </section>

            <Feedback />
            <ShareRow url={shareUrl} shareText={shareText} />
            <WhyBuild />
          </div>
        )}

        {status === "ready" && !result && (error || trace.status === "failed") && (
          <FailureRetry error={error} errorCode={errorCode} trace={trace} onRetry={retry} editHref={editHref} />
        )}

        {(status === "checking" || status === "ready") && !result && !error && trace.status !== "failed" && (
          <LoadingState trace={trace} />
        )}
      </section>
    </main>
  );
}
