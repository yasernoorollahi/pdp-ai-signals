import { createPrompt } from './promptTemplate.js';

const INTENT_CONTRACT = `{
  "meta": { "language": "string", "confidence": 0.0 },
  "data": {
    "goals": ["string"],
    "plans": ["string"],
    "commitments": ["string"],
    "decisions": ["string"],
    "obligations": ["string"],
    "temporal_scope": "string"
  }
}`;

export const buildIntentPrompt = (text: string): string => createPrompt('intent', INTENT_CONTRACT, text);
