"use client";

import Link from "next/link";
import { AlertCircle, RotateCw } from "lucide-react";
import type { TraceState } from "@/lib/analysis-trace";
import { Button } from "@/components/ui/button";
import { ProvenanceTag } from "./provenance-tag";

import { classifyFailure } from "@/lib/failure";

export function FailureRetry({
  error,
  errorCode,
  trace,
  onRetry,
  editHref,
}: {
  error: string;
  errorCode?: string;
  trace: TraceState;
  onRetry: () => void;
  editHref: string;
}) {
  const fetched = typeof trace.metrics.status === "number";
  const { title, detail } = classifyFailure(errorCode, fetched);
  const requestId = trace.result?.scrape.requestId;

  return (
    <section
      role="alert"
      className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <ProvenanceTag kind="run" />
        <AlertCircle className="size-4 text-destructive" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
      <p className="mt-2 break-words font-mono text-xs text-muted-foreground">
        伺服器訊息：{error || "分析無法完成。"}
      </p>
      <p className="mt-1 break-words font-mono text-xs text-muted-foreground">
        請求 ID：{requestId ?? "未回傳請求 ID"}
      </p>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        擷取狀態：{fetched ? trace.metrics.status : "未回傳"}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={onRetry}>
          <RotateCw /> 重新分析
        </Button>
        <Link href={editHref} className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">
          修改網址後重試
        </Link>
      </div>
    </section>
  );
}
