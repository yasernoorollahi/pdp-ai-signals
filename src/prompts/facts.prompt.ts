import { createPrompt } from './promptTemplate.js';

const FACTS_CONTRACT = `{
  "meta": { "language": "string", "confidence": 0.0 },
  "data": {
    "entities": ["string"],
    "activities": ["string"],
    "projects": ["string"],
    "tools": ["string"],
    "locations": ["string"]
  }
}`;

export const buildFactsPrompt = (text: string): string => createPrompt('facts', FACTS_CONTRACT, text);
