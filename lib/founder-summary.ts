import type { AnalysisResponse } from "./contracts";

export const FOUNDER_SECTIONS = [
  { key: "clarity", title: "清晰度", answers: ["understandable_in_10_seconds", "audience", "value_proposition_clarity"] },
  { key: "positioning", title: "定位與轉換", answers: ["differentiation", "strongest_reason_to_choose", "cta_signal", "self_serve_motion"] },
  { key: "trust", title: "信任與訊息", answers: ["trust_strength", "copy_specificity", "change_first"] },
] as const;

type Answer = AnalysisResponse["classifications"][number];
const readable: Record<string, string> = {
  yes: "很可能是", partly: "不確定", no: "很可能不是", clear: "清楚", partly_clear: "部分清楚", unclear: "不清楚",
  developers: "開發者", marketing_teams: "行銷團隊", saas_founders: "SaaS 創辦人", sales_teams: "業務團隊", smbs: "中小企業", enterprise_teams: "企業團隊", consumers: "一般消費者", mixed: "混合", other: "其他",
  strong: "強", moderate: "中等", weak: "弱", not_apparent: "不明顯", customer_outcome: "客戶成果", unique_capability: "獨特能力", proof: "佐證", integrations: "整合", ease_of_use: "容易上手", price_value: "價格與價值", no_clear_reason: "沒有明確理由",
  strongly_self_serve: "明顯自助上手", mostly_self_serve: "以自助上手為主", hybrid: "自助與業務並行", mostly_sales_led: "以業務成交為主", strongly_sales_led: "明顯靠業務成交", none_apparent: "不明顯", mostly_specific: "多半具體", mixed_specific: "混合", mostly_generic: "多半籠統",
};
const ctaActions: Record<string, string> = { start_free: "免費開始", try_product: "試用產品", get_api_key: "取得 API 金鑰", book_demo: "預約展示", join_waitlist: "加入候補名單", contact_sales: "聯絡業務", view_docs: "查看文件", github: "GitHub", none_detected: "未偵測到", other: "其他" };

export function readableAnswer(value: string) { return readable[value] ?? (value.includes("_") && /^(clear|somewhat|unclear)_/.test(value) ? (() => { const cta = splitCtaSignal(value); return `${cta.clarity}・${cta.action}`; })() : value.replaceAll("_", " ")); }

export function splitCtaSignal(value: string) {
  const [clarity, ...actionParts] = value.split("_");
  return { clarity: clarity === "clear" ? "明確" : clarity === "somewhat" ? "還算明確" : "不明確", action: ctaActions[actionParts.join("_")] ?? "其他" };
}

function answer(answers: Answer[], name: string) { return answers.find((item) => item.name === name); }
function value(item: Answer | undefined) { return item && typeof item.value === "string" ? readableAnswer(item.value) : undefined; }

export function founderSynthesis(answers: Answer[]) {
  const formats: Array<[string, (current: string) => string]> = [["audience", (current) => `目標客群為${current}`], ["value_proposition_clarity", (current) => `價值主張${current}`], ["differentiation", (current) => `差異化${current}`], ["self_serve_motion", (current) => `成交模式：${current}`]];
  const parts = formats.flatMap(([name, format]) => { const current = value(answer(answers, name)); return current ? [format(current)] : []; });
  return parts.length ? `Jev 判斷此站${parts.join("、")}。` : "";
}

export function answersForSection(answers: Answer[], names: readonly string[]) { return names.flatMap((name) => { const current = answer(answers, name); return current ? [current] : []; }); }
