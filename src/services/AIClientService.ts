import type { IAIClientService } from '../interfaces/IAIClientService.js';
import type { AIProvider } from '../adapters/ai-providers/AIProvider.js';
import { withRetry } from '../utils/retry.js';

interface AIClientServiceOptions {
  maxRetries: number;
  retryDelayMs: number;
}

export class AIClientService implements IAIClientService {
  constructor(
    private readonly provider: AIProvider,
    private readonly options: AIClientServiceOptions
  ) {}

  public getModelName(): string {
    return this.provider.getModelName();
  }

  public async generate(prompt: string): Promise<string> {
    return withRetry(() => this.provider.generate(prompt), {
      maxRetries: this.options.maxRetries,
      delayMs: this.options.retryDelayMs
    });
  }
}
