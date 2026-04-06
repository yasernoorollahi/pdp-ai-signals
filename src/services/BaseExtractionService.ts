import { z } from 'zod';
import type { IExtractionService } from '../interfaces/IExtractionService.js';
import type { IAIClientService } from '../interfaces/IAIClientService.js';
import type { SignalEnvelope } from '../interfaces/SignalEnvelope.js';
import { parseStrictJson } from '../utils/parseJson.js';
import { OutputValidationError } from '../utils/errors.js';
import type { LiveRequestMonitor } from '../utils/liveRequestMonitor.js';
import type { RequestTraceContext } from '../interfaces/RequestTraceContext.js';
import { emitTraceStage } from '../utils/requestTracing.js';

export abstract class BaseExtractionService<TData> implements IExtractionService<TData> {
  constructor(
    private readonly aiClient: IAIClientService,
    private readonly promptBuilder: (text: string) => string,
    private readonly envelopeSchema: z.ZodSchema<{ meta: { language: string; confidence: number }; data: TData }>,
    private readonly liveRequestMonitor?: LiveRequestMonitor,
    private readonly trace?: RequestTraceContext
  ) {}

  public async extract(text: string): Promise<SignalEnvelope<TData>> {
    const extractionStartedAt = Date.now();
    this.emitStage('service-start', 'Extraction Start', 'started', 1, {
      textLength: text.length
    });
    const prompt = this.promptBuilder(text);
    this.emitStage('prompt-built', 'Prompt Built', 'completed', 2, {
      promptLength: prompt.length
    });
    const raw = await this.aiClient.generate(prompt);
    const parsed = parseStrictJson(raw);
    this.emitStage('response-parsed', 'Response Parsed', 'completed', 5);
    const normalized = this.normalizeParsedOutput(parsed);
    const validated = this.envelopeSchema.safeParse(normalized);

    if (!validated.success) {
      this.emitStage('schema-validation', 'Schema Validated', 'failed', 6, {
        issues: validated.error.issues.length
      });
      throw new OutputValidationError('Model output failed schema validation', validated.error.format());
    }

    this.emitStage('schema-validation', 'Schema Validated', 'completed', 6, {
      confidence: validated.data.meta.confidence
    });
    this.emitStage('service-start', 'Extraction Start', 'completed', 1, {
      durationMs: Date.now() - extractionStartedAt
    });

    return {
      meta: {
        language: validated.data.meta.language,
        model: this.aiClient.getModelName(),
        confidence: validated.data.meta.confidence
      },
      data: validated.data.data
    };
  }

  protected normalizeParsedOutput(parsed: unknown): unknown {
    return parsed;
  }

  protected emitStage(
    stageKey: string,
    label: string,
    status: 'started' | 'completed' | 'failed',
    order: number,
    meta?: Record<string, unknown>
  ): void {
    if (!this.liveRequestMonitor || !this.trace) {
      return;
    }

    emitTraceStage(this.liveRequestMonitor, this.trace, stageKey, label, status, {
      order,
      ...(meta ? { meta } : {})
    });
  }
}
