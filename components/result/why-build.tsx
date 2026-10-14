import { trackGithubClicked, trackReplynodesCtaClicked } from "@/lib/analytics";
import { ProvenanceTag } from "./provenance-tag";

export function WhyBuild() {
  return (
    <section className="rounded-xl border border-dashed bg-card p-4 md:p-5">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">為什麼做這個工具？</h3>
        <ProvenanceTag kind="ui" />
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        創辦人很難用第一次造訪者的眼光看自己的網站。ReplyNodes 會擷取即時網站內容並轉成乾淨的上下文，Jev 則做出結構化的機率判斷。這不是 SEO 分數、不是對公司或產品的客觀評比、不是 AI 偵測器、不能取代客戶訪談，也不是權威的 SaaS 評分。
      </p>
      <p className="mt-4 overflow-x-auto whitespace-nowrap rounded-lg bg-muted px-3 py-3 font-mono text-xs">
        你的網站 → ReplyNodes（即時網頁 → 乾淨上下文）→ Jev（結構化判斷）→ 創辦人拆解
      </p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <a
          className="underline underline-offset-4"
          href="https://replynodes.com/"
          target="_blank"
          rel="noreferrer"
          onClick={() => trackReplynodesCtaClicked("result_footer")}
        >
          用 ReplyNodes 打造
        </a>
        <a
          className="underline underline-offset-4"
          href="https://github.com/replynodes/jev-web-analyzer"
          target="_blank"
          rel="noreferrer"
          onClick={() => trackGithubClicked()}
        >
          在 GitHub 查看原始碼
        </a>
        <span className="text-xs text-muted-foreground">非官方社群專案，與 TypeSafe AI 無關。</span>
      </div>
    </section>
  );
}
