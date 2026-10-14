export type FailureKind = "url" | "request" | "site" | "content" | "rate" | "service" | "unknown";

export type FailureCopy = {
  kind: FailureKind;
  title: string;
  detail: string;
};

const URL_CODES = new Set(["INVALID_URL", "BLOCKED_URL"]);
const REQUEST_CODES = new Set(["INVALID_JSON", "INVALID_INPUT", "REQUEST_TOO_LARGE"]);
const SITE_CODES = new Set(["DNS_LOOKUP_FAILED", "SITE_UNREACHABLE", "FETCH_TIMEOUT"]);
const CONTENT_CODES = new Set(["RESPONSE_TOO_LARGE", "PROVIDER_BAD_RESPONSE", "INVALID_PROVIDER_RESPONSE"]);
const RATE_CODES = new Set(["RATE_LIMITED"]);
const SERVICE_CODES = new Set([
  "NOT_CONFIGURED",
  "PROVIDER_UNAUTHORIZED",
  "PROVIDER_UNAVAILABLE",
  "PROVIDER_UNREACHABLE",
  "PROVIDER_RATE_LIMITED",
  "UPSTREAM_FAILED",
  "ANALYSIS_FAILED",
]);

/**
 * Classifies an analysis failure for the UI.
 *
 * The server collapses several causes into a status code, so the fetch status alone is not
 * enough: a missing credential or an upstream outage would otherwise be reported as
 * "無法連上網站", blaming the user's homepage. Prefer the explicit error code, and fall
 * back to the fetch status only when no code was returned.
 *
 * Request-shape codes (malformed or oversized request body) are a client-side condition and
 * must not be presented as a problem with the URL the user typed.
 */
export function classifyFailure(errorCode: string | undefined, fetched: boolean): FailureCopy {
  const code = (errorCode ?? "").trim().toUpperCase();

  if (URL_CODES.has(code)) {
    return {
      kind: "url",
      title: "無法分析這個網址",
      detail: "只能分析不含帳號密碼的公開 HTTP(S) 頁面。",
    };
  }
  if (REQUEST_CODES.has(code)) {
    return {
      kind: "request",
      title: "分析請求被拒絕",
      detail: "請求格式不正確或內容過大。請重新整理頁面後，再試一次同一個網址。",
    };
  }
  if (SITE_CODES.has(code)) {
    return {
      kind: "site",
      title: "無法連上網站",
      detail: "無法擷取首頁。請檢查網址後手動重試。",
    };
  }
  if (CONTENT_CODES.has(code)) {
    return {
      kind: "content",
      title: "讀不到首頁內容",
      detail:
        "ReplyNodes 沒有為這個頁面回傳可用的乾淨 Markdown。頁面可能是用戶端渲染、內容過大，或封鎖自動化存取。請改試其他網址。",
    };
  }
  if (RATE_CODES.has(code)) {
    return {
      kind: "rate",
      title: "請求過於頻繁",
      detail: "你連續執行了多次分析。請稍候片刻再重試。",
    };
  }
  if (SERVICE_CODES.has(code)) {
    return {
      kind: "service",
      title: "分析服務暫時無法使用",
      detail:
        "已讀取首頁，但 Jev 沒有回傳結果。問題出在我們這邊，可以重試。",
    };
  }
  if (fetched) {
    return {
      kind: "unknown",
      title: "Jev 沒有回傳結果",
      detail: "已擷取首頁，但分類步驟沒有回傳任何內容。可以重試。",
    };
  }
  return {
    kind: "unknown",
    title: "分析未完成",
    detail: "請重試分析，或檢查網址後再試。",
  };
}
