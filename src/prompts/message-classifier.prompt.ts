const CLASSIFICATION_CONTRACT = `{
  "score": 0.0,
  "decision": "USEFUL",
  "reason": "short explanation"
}`;

function escapeInput(input: string): string {
  return input.replace(/```/g, '').trim();
}

export function buildMessageClassifierPrompt(text: string): string {
  return `CAPABILITY: message_classification
You are a strict classifier for user messages.
Task:
Classify whether the input contains meaningful personal signals worth deeper extraction.

Meaningful signals include:
- personal events
- actions performed by the user
- plans or intentions
- emotions or feelings
- social interactions
- work or project related activities
- time-based events (today, tomorrow, morning, etc.)

Messages to ignore include:
- greetings (hello, hi, salam)
- very short messages
- random characters
- numbers only
- meaningless text
- single words without context

Scoring and decision rules:
1) Compute "score" as a probability from 0 to 1.
2) If score >= 0.6, set decision to "USEFUL".
3) If score < 0.6, set decision to "IGNORE".

Output requirements:
1) Output strict JSON only. No prose. No markdown.
2) Follow this exact JSON shape:
${CLASSIFICATION_CONTRACT}
3) "reason" must be short and concrete.

Input text:
${escapeInput(text)}`;
}
