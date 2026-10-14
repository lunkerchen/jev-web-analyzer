import type { Metadata } from "next";
import { ResultPage } from "@/components/result-page";

export const metadata: Metadata = {
  title: "分析結果 · Jev 網站分析器 · ReplyNodes",
  description: "Jev 怎麼看你的 SaaS：以 ReplyNodes 與 Jev 對首頁做出的結構化判斷。",
};

export default function Page() {
  return <ResultPage />;
}
