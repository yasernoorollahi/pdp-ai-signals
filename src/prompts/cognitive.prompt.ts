import { createPrompt } from './promptTemplate.js';

const COGNITIVE_CONTRACT = `{
  "meta": { "language": "string", "confidence": 0.0 },
  "data": {
    "uncertainty_language": ["string"],
    "confidence_language": ["string"],
    "clarity_level": "low|medium|high",
    "decision_state": "undecided|considering|decided",
    "hesitation_detected": true
  }
}`;

export const buildCognitivePrompt = (text: string): string => createPrompt('cognitive', COGNITIVE_CONTRACT, text);
