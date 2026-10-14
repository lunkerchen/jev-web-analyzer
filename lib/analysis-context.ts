export const ANALYSIS_CONTEXT_CAP = 120_000;

export type AnalysisContext = {
  state: string;
  sentCharacters: number;
  sourceCharacters: number;
  contextTruncated: boolean;
};

export function prepareAnalysisContext(cleanMarkdown: string): AnalysisContext {
  const sourceCharacters = cleanMarkdown.length;
  const state = cleanMarkdown.slice(0, ANALYSIS_CONTEXT_CAP);
  return {
    state,
    sentCharacters: state.length,
    sourceCharacters,
    contextTruncated: sourceCharacters > ANALYSIS_CONTEXT_CAP,
  };
}

export function analysisContextLabel(context: Pick<AnalysisContext, "sentCharacters" | "sourceCharacters" | "contextTruncated">) {
  return context.contextTruncated
    ? `顯示前 ${context.sentCharacters.toLocaleString()} 個字元（共擷取 ${context.sourceCharacters.toLocaleString()} 個字元）`
    : `顯示全部 ${context.sourceCharacters.toLocaleString()} 個擷取字元`;
}
