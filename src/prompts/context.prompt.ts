import { createPrompt } from './promptTemplate.js';

const CONTEXT_CONTRACT = `{
  "meta": { "language": "string", "confidence": 0.0 },
  "data": {
    "likes": ["string"],
    "dislikes": ["string"],
    "declared_avoidances": ["string"],
    "time_constraints": ["string"],
    "resource_constraints": ["string"],
    "collaboration_detected": true
  }
}`;

export const buildContextPrompt = (text: string): string => createPrompt('context', CONTEXT_CONTRACT, text);
