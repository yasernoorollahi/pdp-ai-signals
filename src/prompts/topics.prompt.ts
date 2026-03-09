import { createPrompt } from './promptTemplate.js';

const TOPICS_CONTRACT = `{
  "meta": { "language": "string", "confidence": 0.0 },
  "data": {
    "topic_tags": ["string"],
    "domain_classification": ["string"]
  }
}`;

export const buildTopicsPrompt = (text: string): string => createPrompt('topics', TOPICS_CONTRACT, text);
