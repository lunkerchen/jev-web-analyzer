"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/site-header";
import type { LeaderboardRow } from "@/lib/csv";
import { EXAMPLE_DOMAINS, exampleDomainUrl } from "@/lib/example-domains";
import { MAX_JUDGMENTS, type Judgment } from "@/lib/judgment";
import { scoreBand } from "@/lib/leaderboard-format";
import { resultPath, safeInitialUrl } from "@/lib/query-url";
import { saveSessionJudgments } from "@/lib/session-judgments";

export function Analyzer({ leaderboardPreview = [] }: { leaderboardPreview?: LeaderboardRow[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [judgments, setJudgments] = useState<Judgment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setUrl(safeInitialUrl(new URLSearchParams(window.location.search).get("url"))); }, []);

  function fillExample(domain: string) {
    setUrl(exampleDomainUrl(domain));
    urlInputRef.current?.focus();
  }

  function update(index: number, patch: Partial<Judgment>) {
    setJudgments((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function submit() {
    const trimmed = url.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    const target = safeInitialUrl(trimmed) || trimmed;
    saveSessionJudgments(target, judgments);
    router.push(resultPath(target));
  }

  return (
    <main className="min-h-screen overflow-x-hidden px-4 py-5 md:px-8">
      <SiteHeader crumb="jev 網站分析器" />
      <section className="mx-auto max-w-5xl pb-16 pt-16 md:pt-24">
        <div className="max-w-3xl">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Jev 網站分析器</p>
          <h1 className="text-4xl font-light tracking-tight md:text-6xl">貼上你的首頁，看看 Jev 讀到什麼。</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">ReplyNodes 會把頁面轉成乾淨的 Markdown，Jev 再判斷它傳達給首次造訪者的訊息。</p>
        </div>
        <div className="mt-10 rounded-2xl border bg-card p-3 shadow-border-medium md:p-4">
          <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="flex flex-col gap-3 md:flex-row">
            <Input ref={urlInputRef} aria-label="公開網址" type="url" required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://yourproduct.com" className="h-12 min-w-0 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0" />
            <Button type="submit" disabled={submitting || !url.trim()} className="h-12 rounded-xl px-6">
              {submitting ? <LoaderCircle className="animate-spin" /> : null}
              {submitting ? "開啟中" : "分析 →"}
            </Button>
          </form>
        </div>
        <LeaderboardPreview rows={leaderboardPreview} />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">試試看：</span>
          {EXAMPLE_DOMAINS.map((domain) => (
            <button key={domain} type="button" onClick={() => fillExample(domain)} className="flex min-h-11 items-center rounded-full border px-3 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              {domain}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">免註冊，只使用你的公開網站。</p>
        <CustomJudgments judgments={judgments} setJudgments={setJudgments} update={update} />
        <footer className="mt-16 flex flex-col gap-2 border-t pt-5 text-xs text-muted-foreground md:flex-row md:justify-between">
          <span>由 ReplyNodes 擷取 · Jev 由 TypeSafe API 判斷</span>
          <span>非官方社群專案，與 TypeSafe AI 無關。</span>
        </footer>
      </section>
    </main>
  );
}

function LeaderboardPreview({ rows }: { rows: LeaderboardRow[] }) {
  if (!rows.length) return null;
  return (
    <div className="mt-6 rounded-2xl border bg-card p-4 shadow-border-small">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Jev 排行榜</p>
          <p className="mt-0.5 text-xs text-muted-foreground">其他首頁依同一套評分標準的得分。</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/leaderboard">看更多 →</Link>
        </Button>
      </div>
      <ul className="mt-3 divide-y">
        {rows.map((row) => {
          if (row.overall === undefined) return null;
          return (
            <li key={row.domain}>
              <Link href={`/leaderboard/${row.domain}`} className="flex items-center justify-between gap-3 py-2 hover:opacity-80">
                <span className="truncate text-sm">{row.domain}</span>
                <span
                  className="inline-flex min-w-10 shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: scoreBand(row.overall).hex }}
                >
                  {row.overall}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CustomJudgments({ judgments, setJudgments, update }: { judgments: Judgment[]; setJudgments: (items: Judgment[]) => void; update: (index: number, patch: Partial<Judgment>) => void }) {
  return (
    <div className="mt-5 rounded-xl border border-dashed p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">自訂判斷（選填）</p>
          <p className="mt-1 text-xs text-muted-foreground">最多可新增三題，題型可選是非題、選擇題或評分題。</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => judgments.length < MAX_JUDGMENTS && setJudgments([...judgments, { name: `custom_${judgments.length + 1}`, type: "boolean", instructions: "", criteria: "" }])} disabled={judgments.length >= MAX_JUDGMENTS}>
          <Plus /> 新增
        </Button>
      </div>
      {judgments.map((judgment, index) => (
        <div key={index} className="mt-4 grid gap-2 rounded-lg bg-muted/50 p-3 md:grid-cols-[1fr_120px_2fr_2fr_auto]">
          <Input aria-label="判斷名稱" value={judgment.name} onChange={(event) => update(index, { name: event.target.value })} placeholder="名稱" />
          <select aria-label="判斷類型" className="h-9 rounded-md border bg-background px-2 text-sm" value={judgment.type} onChange={(event) => update(index, { type: event.target.value as Judgment["type"] })}>
            <option value="boolean">是非題</option>
            <option value="choice">選擇題</option>
            <option value="score">評分題</option>
          </select>
          <Input aria-label="判斷說明" value={judgment.instructions} onChange={(event) => update(index, { instructions: event.target.value })} placeholder="要讓 Jev 判斷什麼？" />
          <Input aria-label="判斷標準" value={judgment.criteria} onChange={(event) => update(index, { criteria: event.target.value })} placeholder={judgment.type === "choice" ? "key: 說明，一行一項" : judgment.type === "score" ? "一行一個等級" : "標準（選填）"} />
          <Button type="button" variant="ghost" size="icon" aria-label="移除判斷" onClick={() => setJudgments(judgments.filter((_, i) => i !== index))}>
            <Trash2 />
          </Button>
        </div>
      ))}
    </div>
  );
}
