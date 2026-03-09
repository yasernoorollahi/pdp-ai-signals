function escapeInput(text: string): string {
  return text.replace(/```/g, '');
}

export function createPrompt(capability: string, outputContract: string, inputText: string): string {
  return `CAPABILITY: ${capability}\nYou are a strict cognitive signal extractor.\nRules:\n1) Output must be strict JSON only, no prose, no markdown.\n2) Use only explicitly stated information from input text.\n3) Do not infer hidden intent, pattern, trend, or future behavior.\n4) Do not aggregate across sessions. Treat input as standalone.\n5) If information is absent, return empty arrays, false, or \"unknown\" only where allowed by schema.\n6) Keep values concise and literal.\n\nRequired JSON schema:\n${outputContract}\n\nInput text:\n${escapeInput(inputText)}`;
}
