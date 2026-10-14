export function safeError(error: unknown) {
  const code = error instanceof Error ? error.message : "ANALYSIS_FAILED";
  if (code === "RESPONSE_TOO_LARGE") return { status: 400, code, message: "這個頁面太大，無法分析。" };
  if (["INVALID_URL", "BLOCKED_URL"].includes(code)) return { status: 400, code, message: "無法分析這個網址。" };
  if (code === "RATE_LIMITED") return { status: 429, code, message: "請求過於頻繁，請稍後再試。" };
  if (code === "FETCH_TIMEOUT") return { status: 504, code, message: "網站回應時間過長，無法完成分析，請稍後再試。" };
  if (code === "DNS_LOOKUP_FAILED") return { status: 502, code, message: "找不到這個網站的位址，請檢查網址後再試。" };
  if (code === "SITE_UNREACHABLE") return { status: 502, code, message: "無法取得這個網站的內容。網站可能封鎖自動化存取、需要登入，或暫時無法連線。請改試其他網址。" };
  if (code === "PROVIDER_RATE_LIMITED") return { status: 503, code, message: "網頁內容服務目前請求量過大，請稍後再試。" };
  if (code === "PROVIDER_UNAVAILABLE" || code === "PROVIDER_UNREACHABLE") return { status: 503, code, message: "網頁內容服務暫時無法使用，請稍後再試。" };
  if (code === "PROVIDER_UNAUTHORIZED") return { status: 503, code, message: "分析服務暫時無法使用。" };
  if (code === "PROVIDER_BAD_RESPONSE" || code === "INVALID_PROVIDER_RESPONSE") return { status: 502, code, message: "ReplyNodes 沒有為這個網站回傳可用的乾淨 Markdown。網站可能是用戶端渲染，或封鎖自動化存取。請改試其他網址。" };
  return { status: 502, code: "UPSTREAM_FAILED", message: "無法完成分析，請稍後再試。" };
}
