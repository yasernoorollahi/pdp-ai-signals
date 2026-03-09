import { ProviderError } from '../../utils/errors.js';
import type { AIProvider } from './AIProvider.js';

interface OpenAIProviderOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

export class OpenAIProvider implements AIProvider {
  constructor(private readonly options: OpenAIProviderOptions) {}

  public getModelName(): string {
    return this.options.model;
  }

  public async generate(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId =
      this.options.timeoutMs > 0 ? setTimeout(() => controller.abort(), this.options.timeoutMs) : null;

    try {
      const response = await fetch(`${this.options.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.options.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.options.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0,
          response_format: { type: 'json_object' }
        }),
        signal: this.options.timeoutMs > 0 ? controller.signal : null
      });

      if (!response.ok) {
        const body = await response.text();
        throw new ProviderError('OpenAI request failed', { status: response.status, body });
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | null } }>;
      };

      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        throw new ProviderError('OpenAI response missing content', payload);
      }

      return content;
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      throw new ProviderError('OpenAI provider error', { cause: error });
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
}
