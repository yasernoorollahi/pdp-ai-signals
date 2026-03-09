import { ProviderError } from '../../utils/errors.js';
import type { AIProvider } from './AIProvider.js';

interface OllamaProviderOptions {
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

export class OllamaProvider implements AIProvider {
  constructor(private readonly options: OllamaProviderOptions) {}

  public getModelName(): string {
    return this.options.model;
  }

  public async generate(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId =
      this.options.timeoutMs > 0 ? setTimeout(() => controller.abort(), this.options.timeoutMs) : null;

    try {
      const response = await fetch(`${this.options.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.options.model,
          prompt,
          stream: false,
          options: {
            temperature: 0
          }
        }),
        signal: this.options.timeoutMs > 0 ? controller.signal : null
      });

      if (!response.ok) {
        const body = await response.text();
        throw new ProviderError('Ollama request failed', { status: response.status, body });
      }

      const payload = (await response.json()) as { response?: string };

      if (!payload.response) {
        throw new ProviderError('Ollama response missing content', payload);
      }

      return payload.response;
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      throw new ProviderError('Ollama provider error', { cause: error });
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
}
