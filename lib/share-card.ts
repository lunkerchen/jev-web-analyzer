import type { AnalysisResponse } from "./contracts";
import { labelFor, signalMeta, statusForDisplay } from "./signal-map";

const STATUS_PHRASE: Record<string, string> = {
  supported: "有支持",
  partial: "部分支持",
  weak: "偏弱",
  insufficient: "無法判斷",
};

function hostname(url: string): string {
  try {
    return new URL(url).hostname || url;
  } catch {
    return url;
  }
}

/**
 * Share text built from the same status mapping as the page. It carries no
 * numeric total, score or percentage — only the returned enum statuses.
 */
export function buildShareText(result: AnalysisResponse): string {
  const parts = result.classifications
    .filter((classification) => signalMeta(classification.name)?.kind === "valence" && classification.name !== "change_first")
    .map((classification) => `${labelFor(classification.name)}：${STATUS_PHRASE[statusForDisplay(classification.name, String(classification.value))]}`);
  const body = parts.length ? parts.join("、") : "沒有回傳可評估的訊號";
  return `Jev 對 ${hostname(result.url)} 的判讀：${body}。僅為 Jev 回傳的選項。`;
}
