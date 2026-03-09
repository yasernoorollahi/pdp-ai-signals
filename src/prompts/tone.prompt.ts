import { createPrompt } from './promptTemplate.js';

const TONE_CONTRACT = `{
  "meta": { "language": "string", "confidence": 0.0 },
  "data": {
    "sentiment": "positive|neutral|negative|mixed",
    "mood": "string",
    "motivation_level": "low|medium|high",
    "effort_perception": "low|medium|high",
    "friction_detected": true
  }
}`;

export const buildTonePrompt = (text: string): string => createPrompt('tone', TONE_CONTRACT, text);
