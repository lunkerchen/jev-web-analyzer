import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { formatRunDate, loadLeaderboardData, scoreQuestionMeta } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "排行榜 · Jev 網站分析器 · ReplyNodes",
  description: "SaaS 與開發工具的首頁，能否讓第一次來的訪客看懂？由 Jev 依據固定且公開的評分標準判斷。",
};

export default function LeaderboardPage() {
  const data = loadLeaderboardData();

  if (!data) {
    return (
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <SiteHeader crumb="排行榜" />
        <p className="text-muted-foreground">尚未產生排行榜資料。請執行 <code className="rounded bg-muted px-1 py-0.5">pnpm run batch</code> 來產生。</p>
      </main>
    );
  }

  const { dataset, rubric } = data;
  const scoreQuestions = scoreQuestionMeta(rubric);
  const okRows = dataset.rows.filter((row) => row.status === "ok");
  const failedCount = dataset.rows.length - okRows.length;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <SiteHeader crumb="排行榜" />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Jev 首頁排行榜</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          各網站首頁能否讓第一次來的訪客看懂，由 Jev 依據固定的評分標準判斷。這不代表產品或公司的品質，詳見{" "}
          <a href="https://github.com/replynodes/jev-web-analyzer/blob/main/METHODOLOGY.md" target="_blank" rel="noreferrer" className="underline underline-offset-2">評測方法</a>。
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>評分標準版本 <b className="font-mono text-foreground">{dataset.rubric_version}</b></span>
          <span>執行日期 <b className="text-foreground">{formatRunDate(dataset.generated_at)}</b></span>
          <a href="https://github.com/replynodes/jev-web-analyzer/blob/main/METHODOLOGY.md" target="_blank" rel="noreferrer" className="underline underline-offset-2">評測方法</a>
        </div>
      </div>

      {dataset.sample ? (
        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          這是供展示用的小型範例資料，並非 Jev 的實際輸出。請執行批次腳本來產生真實結果。
        </div>
      ) : null}

      <LeaderboardTable rows={okRows} scoreQuestions={scoreQuestions} />

      {failedCount > 0 ? (
        <p className="text-xs text-muted-foreground">本次有 {failedCount} 個網域分析失敗，未列入上方表格。</p>
      ) : null}
    </main>
  );
}
