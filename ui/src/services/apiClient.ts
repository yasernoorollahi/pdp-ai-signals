import axios from 'axios';

export type ProviderType = 'openai' | 'ollama';

export type ExtractionStepKey =
  | 'facts'
  | 'intent'
  | 'tone'
  | 'cognitive'
  | 'context'
  | 'topics';

export interface SignalEnvelope<T = unknown> {
  meta: {
    language: string;
    model: string;
    confidence: number;
  };
  data: T;
}

export interface ModelsResponse {
  provider: ProviderType;
  models: string[];
  defaultModel: string | null;
  warning?: string;
}

export const STEP_ENDPOINTS: Array<{ key: ExtractionStepKey; label: string; endpoint: string }> = [
  { key: 'facts', label: 'Facts', endpoint: '/extract/facts' },
  { key: 'intent', label: 'Intent', endpoint: '/extract/intent' },
  { key: 'tone', label: 'Tone', endpoint: '/extract/tone' },
  { key: 'cognitive', label: 'Cognitive', endpoint: '/extract/cognitive' },
  { key: 'context', label: 'Context', endpoint: '/extract/context' },
  { key: 'topics', label: 'Topics', endpoint: '/extract/topics' }
];

export const apiClient = axios.create({
  baseURL: '/',
  timeout: 0,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function fetchModels(provider: ProviderType): Promise<ModelsResponse> {
  const { data } = await apiClient.get<ModelsResponse>(`/models/${provider}`);
  return data;
}

export async function runExtractionStep<T = unknown>(
  endpoint: string,
  payload: { text: string; provider: ProviderType; model: string }
): Promise<SignalEnvelope<T>> {
  const { data } = await apiClient.post<SignalEnvelope<T>>(endpoint, payload);
  return data;
}
