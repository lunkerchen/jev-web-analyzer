import type { FounderQuestionName } from "./founder-questions";

export type SignalKind = "valence" | "informational";
export type SignalTier = "primary" | "secondary";
export type SignalStatus = "supported" | "partial" | "weak" | "insufficient";

export type SignalMeta = {
  label: string;
  kind: SignalKind;
  tier: SignalTier;
};

export const SIGNAL_META: Record<FounderQuestionName, SignalMeta> = {
  understandable_in_10_seconds: { label: "10 秒內看得懂", kind: "valence", tier: "primary" },
  audience: { label: "目標客群", kind: "informational", tier: "secondary" },
  value_proposition_clarity: { label: "價值主張清晰度", kind: "valence", tier: "primary" },
  differentiation: { label: "差異化", kind: "valence", tier: "primary" },
  strongest_reason_to_choose: { label: "選擇理由", kind: "informational", tier: "secondary" },
  cta_signal: { label: "行動按鈕訊號", kind: "valence", tier: "primary" },
  trust_strength: { label: "信任強度", kind: "valence", tier: "primary" },
  self_serve_motion: { label: "成交模式", kind: "informational", tier: "secondary" },
  copy_specificity: { label: "文案具體度", kind: "valence", tier: "primary" },
  change_first: { label: "優先修改", kind: "valence", tier: "primary" },
};

export const PRIMARY_SIGNAL_NAMES = [
  "understandable_in_10_seconds",
  "value_proposition_clarity",
  "differentiation",
  "cta_signal",
  "trust_strength",
  "copy_specificity",
] as const;

export const SECONDARY_SIGNAL_NAMES = [
  "audience",
  "strongest_reason_to_choose",
  "self_serve_motion",
] as const;

export const CHANGE_FIRST_SIGNAL = "change_first" as const;

/**
 * Values Jev returns that must never be rendered as a conclusion (R7). They
 * carry no actionable judgment about the homepage.
 */
export const NON_ACTIONABLE_VALUES: ReadonlySet<string> = new Set([
  "other",
  "no_clear_reason",
  "not_apparent",
  "none_apparent",
  "unclear_other",
  "unclear_none_detected",
]);

export function isNonActionable(value: string): boolean {
  return NON_ACTIONABLE_VALUES.has(value);
}

/**
 * Negative enum values Jev can return (R9). Used to derive the "couldn't
 * confirm" list and to skip negative options when looking for the next
 * actionable alternative.
 */
export function isNegativeValue(value: string): boolean {
  return (
    value === "weak" ||
    value === "mostly_generic" ||
    value === "unclear" ||
    value === "no_clear_reason" ||
    value.startsWith("unclear") ||
    value.endsWith("_apparent")
  );
}

export function isActionable(value: string): boolean {
  return !isNonActionable(value) && !isNegativeValue(value);
}

/**
 * Exhaustive status mapping. Every enum value declared in
 * `lib/founder-questions.ts` is listed explicitly; an unknown signal or value
 * throws instead of silently falling through.
 *
 * Informational signals (audience, strongest_reason_to_choose,
 * self_serve_motion) carry no good/bad valence; their actionable values map to
 * the neutral `partial` bucket and the UI never renders a chip for them.
 */
const STATUS_BY_SIGNAL: Record<FounderQuestionName, Record<string, SignalStatus>> = {
  understandable_in_10_seconds: { yes: "supported", partly: "partial", no: "weak" },
  audience: {
    developers: "partial",
    marketing_teams: "partial",
    saas_founders: "partial",
    sales_teams: "partial",
    smbs: "partial",
    enterprise_teams: "partial",
    consumers: "partial",
    mixed: "partial",
    other: "insufficient",
  },
  value_proposition_clarity: { clear: "supported", partly_clear: "partial", unclear: "weak" },
  differentiation: { strong: "supported", moderate: "partial", weak: "weak", not_apparent: "insufficient" },
  strongest_reason_to_choose: {
    customer_outcome: "partial",
    unique_capability: "partial",
    proof: "partial",
    integrations: "partial",
    ease_of_use: "partial",
    price_value: "partial",
    no_clear_reason: "insufficient",
    other: "insufficient",
  },
  cta_signal: {
    clear_start_free: "supported",
    clear_try_product: "supported",
    clear_get_api_key: "supported",
    clear_book_demo: "supported",
    clear_join_waitlist: "supported",
    clear_contact_sales: "supported",
    clear_view_docs: "supported",
    clear_github: "supported",
    somewhat_start_free: "partial",
    somewhat_try_product: "partial",
    somewhat_get_api_key: "partial",
    somewhat_book_demo: "partial",
    somewhat_view_docs: "partial",
    somewhat_github: "partial",
    unclear_none_detected: "insufficient",
    unclear_other: "insufficient",
  },
  trust_strength: { strong: "supported", moderate: "partial", weak: "weak", none_apparent: "insufficient" },
  self_serve_motion: {
    strongly_self_serve: "partial",
    mostly_self_serve: "partial",
    hybrid: "partial",
    mostly_sales_led: "partial",
    strongly_sales_led: "partial",
  },
  copy_specificity: { mostly_specific: "supported", mixed: "partial", mostly_generic: "weak" },
  change_first: {
    lead_with_customer_outcome: "supported",
    add_customer_proof: "supported",
    clarify_differentiation: "supported",
    make_cta_explicit: "supported",
    tighten_target_audience: "supported",
    explain_value_proposition: "supported",
    other: "insufficient",
  },
};

export function signalMeta(name: string): SignalMeta | undefined {
  return (SIGNAL_META as Record<string, SignalMeta>)[name];
}

export function labelFor(name: string): string {
  return signalMeta(name)?.label ?? humanize(name);
}

/**
 * Status chip is only meaningful for evaluative signals. Informational signals
 * and the change-first card never render one.
 */
export function hasStatusChip(name: string): boolean {
  return signalMeta(name)?.kind === "valence" && name !== CHANGE_FIRST_SIGNAL;
}

export function statusFor(name: string, value: string): SignalStatus {
  const byValue = (STATUS_BY_SIGNAL as Record<string, Record<string, SignalStatus>>)[name];
  if (!byValue) throw new Error(`Unknown signal: ${name}`);
  const status = byValue[value];
  if (!status) throw new Error(`Unknown value "${value}" for signal "${name}"`);
  return status;
}

/**
 * UI-facing variant: an unrecognized enum from Jev is surfaced as the
 * neutral `partial` chip rather than crashing the page.
 */
export function statusForDisplay(name: string, value: string): SignalStatus {
  try {
    return statusFor(name, value);
  } catch {
    return "partial";
  }
}

export const ACRONYMS: Record<string, string> = {
  cta: "CTA",
  api: "API",
  saas: "SaaS",
  smbs: "SMBs",
  github: "GitHub",
  mcp: "MCP",
  icp: "ICP",
  seo: "SEO",
};

export function humanize(value: string): string {
  const joined = value
    .split("_")
    .map((word) => ACRONYMS[word] ?? word)
    .join(" ");
  return joined.length ? joined.charAt(0).toUpperCase() + joined.slice(1) : joined;
}

const VALUE_LABELS: Record<string, string> = {
  yes: "是",
  partly: "部分",
  no: "否",
  clear: "清楚",
  partly_clear: "部分清楚",
  unclear: "不清楚",
  developers: "開發者",
  marketing_teams: "行銷團隊",
  saas_founders: "SaaS 創辦人",
  sales_teams: "業務團隊",
  smbs: "中小企業",
  enterprise_teams: "企業團隊",
  consumers: "一般消費者",
  mixed: "混合",
  other: "其他",
  strong: "強",
  moderate: "中等",
  weak: "弱",
  not_apparent: "不明顯",
  none_apparent: "不明顯",
  customer_outcome: "客戶成果",
  unique_capability: "獨特能力",
  proof: "佐證",
  integrations: "整合",
  ease_of_use: "容易上手",
  price_value: "價格與價值",
  no_clear_reason: "沒有明確理由",
  strongly_self_serve: "明顯自助上手",
  mostly_self_serve: "以自助上手為主",
  hybrid: "自助與業務並行",
  mostly_sales_led: "以業務成交為主",
  strongly_sales_led: "明顯靠業務成交",
  mostly_specific: "多半具體",
  mostly_generic: "多半籠統",
  lead_with_customer_outcome: "先講客戶成果",
  add_customer_proof: "加上客戶證據",
  clarify_differentiation: "釐清差異化",
  make_cta_explicit: "讓行動按鈕更明確",
  tighten_target_audience: "收斂目標客群",
  explain_value_proposition: "說明價值主張",
};

const CTA_CLARITY: Record<string, string> = { clear: "明確", somewhat: "還算明確", unclear: "不明確" };

const CTA_ACTIONS: Record<string, string> = {
  start_free: "免費開始",
  try_product: "試用產品",
  get_api_key: "取得 API 金鑰",
  book_demo: "預約展示",
  join_waitlist: "加入候補名單",
  contact_sales: "聯絡業務",
  view_docs: "查看文件",
  github: "GitHub",
  none_detected: "未偵測到",
  other: "其他",
};

/**
 * Traditional Chinese display label for an enum value Jev returned. Unknown
 * values fall back to the humanized enum key instead of throwing.
 */
export function valueLabel(value: string): string {
  const known = VALUE_LABELS[value];
  if (known) return known;
  const [prefix, ...rest] = value.split("_");
  const action = CTA_ACTIONS[rest.join("_")];
  if (CTA_CLARITY[prefix] && action) return `${CTA_CLARITY[prefix]}・${action}`;
  return humanize(value);
}
