import type { IAIClientService } from '../interfaces/IAIClientService.js';
import type { AIProvider } from '../adapters/ai-providers/AIProvider.js';
import { withRetry } from '../utils/retry.js';
import type { LiveRequestMonitor } from '../utils/liveRequestMonitor.js';
import type { RequestTraceContext } from '../interfaces/RequestTraceContext.js';
import { emitTraceStage } from '../utils/requestTracing.js';

interface AIClientServiceOptions {
  maxRetries: number;
  retryDelayMs: number;
}

export class AIClientService implements IAIClientService {
  constructor(
    private readonly provider: AIProvider,
    private readonly options: AIClientServiceOptions,
    private readonly liveRequestMonitor?: LiveRequestMonitor,
    private readonly trace?: RequestTraceContext
  ) {}

  public getModelName(): string {
    return this.provider.getModelName();
  }

  public async generate(prompt: string): Promise<string> {
    const startedAt = Date.now();
    if (this.liveRequestMonitor && this.trace) {
      emitTraceStage(this.liveRequestMonitor, this.trace, 'provider-call', 'Provider Call', 'started', {
        order: 4,
        meta: {
          provider: this.trace.provider ?? 'unknown',
          model: this.getModelName(),
          promptLength: prompt.length,
          retries: this.options.maxRetries
        }
      });
    }

    const raw = await withRetry(() => this.provider.generate(prompt), {
      maxRetries: this.options.maxRetries,
      delayMs: this.options.retryDelayMs
    });

    if (this.liveRequestMonitor && this.trace) {
      emitTraceStage(this.liveRequestMonitor, this.trace, 'provider-call', 'Provider Call', 'completed', {
        order: 4,
        durationMs: Date.now() - startedAt,
        meta: {
          model: this.getModelName(),
          outputLength: raw.length
        }
      });
    }

    return raw;
  }
}
