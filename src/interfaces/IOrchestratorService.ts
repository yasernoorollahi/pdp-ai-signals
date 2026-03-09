import type { FactsData } from '../schemas/facts.schema.js';
import type { IntentData } from '../schemas/intent.schema.js';
import type { ToneData } from '../schemas/tone.schema.js';
import type { CognitiveData } from '../schemas/cognitive.schema.js';
import type { ContextData } from '../schemas/context.schema.js';
import type { TopicsData } from '../schemas/topics.schema.js';
import type { SignalMeta } from './SignalEnvelope.js';

export interface CombinedSignals {
  meta: SignalMeta;
  data: {
    facts: FactsData;
    intent: IntentData;
    tone: ToneData;
    cognitive: CognitiveData;
    context: ContextData;
    topics: TopicsData;
  };
}

export interface IOrchestratorService {
  extractAll(text: string): Promise<CombinedSignals>;
}
