import { OpenAIProvider } from '../adapters/ai-providers/OpenAIProvider.js';
import { OllamaProvider } from '../adapters/ai-providers/OllamaProvider.js';
import { MockProvider } from '../adapters/ai-providers/MockProvider.js';
import type { AIProvider } from '../adapters/ai-providers/AIProvider.js';
import type { AppConfig } from './env.js';
import { AppError } from '../utils/errors.js';

export interface ProviderOverrides {
  provider?: AppConfig['AI_PROVIDER'];
  model?: string;
}

export function createProvider(config: AppConfig, overrides?: ProviderOverrides): AIProvider {
  const provider = overrides?.provider ?? config.AI_PROVIDER;
  const model = overrides?.model?.trim() || config.AI_MODEL;

  if (provider === 'openai') {
    if (!config.OPENAI_API_KEY) {
      throw new AppError('OPENAI_API_KEY is required when AI_PROVIDER=openai', 500, 'CONFIG_ERROR');
    }

    return new OpenAIProvider({
      apiKey: config.OPENAI_API_KEY,
      baseUrl: config.OPENAI_BASE_URL,
      model,
      timeoutMs: config.REQUEST_TIMEOUT_MS
    });
  }

  if (provider === 'ollama') {
    return new OllamaProvider({
      baseUrl: config.OLLAMA_BASE_URL,
      model,
      timeoutMs: config.REQUEST_TIMEOUT_MS
    });
  }

  return new MockProvider();
}
