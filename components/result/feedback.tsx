"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProvenanceTag } from "./provenance-tag";

export function Feedback() {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  return (
    <div className="flex flex-col justify-between gap-3 border-t pt-6 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-base font-semibold">這份判讀有幫助嗎？</h2>
        <p className="mt-1 text-sm text-muted-foreground">回饋只會留在你的瀏覽器，不會傳給 Jev。</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ProvenanceTag kind="ui" />
        <Button type="button" variant="outline" size="sm" onClick={() => setAnswer("yes")}>
          {answer === "yes" ? "已記下" : "有幫助"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setAnswer("no")}>
          {answer === "no" ? "已記下" : "不太有幫助"}
        </Button>
      </div>
    </div>
  );
}
