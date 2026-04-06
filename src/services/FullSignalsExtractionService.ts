import { buildFullSignalsPrompt } from '../prompts/full-signals.prompt.js';
import type { IAIClientService } from '../interfaces/IAIClientService.js';
import type { IFullSignalsExtractionService } from '../interfaces/IFullSignalsExtractionService.js';
import { parseStrictJson } from '../utils/parseJson.js';
import { OutputValidationError } from '../utils/errors.js';
import { FullSignalsSchema, type FullSignals } from '../schemas/full-signals.schema.js';
import type { LiveRequestMonitor } from '../utils/liveRequestMonitor.js';
import type { RequestTraceContext } from '../interfaces/RequestTraceContext.js';
import { emitTraceStage } from '../utils/requestTracing.js';

export class FullSignalsExtractionService implements IFullSignalsExtractionService {
  constructor(
    private readonly aiClient: IAIClientService,
    private readonly liveRequestMonitor?: LiveRequestMonitor,
    private readonly trace?: RequestTraceContext
  ) {}

  public async extract(text: string): Promise<FullSignals> {
    const extractionStartedAt = Date.now();
    this.emitStage('service-start', 'Extraction Start', 'started', 1, {
      textLength: text.length
    });
    const prompt = buildFullSignalsPrompt(text);
    this.emitStage('prompt-built', 'Prompt Built', 'completed', 2, {
      promptLength: prompt.length
    });
    const raw = await this.aiClient.generate(prompt);
    const parsed = parseStrictJson(raw);
    this.emitStage('response-parsed', 'Response Parsed', 'completed', 5);
    const validated = FullSignalsSchema.safeParse(parsed);

    if (validated.success) {
      this.emitStage('schema-validation', 'Schema Validated', 'completed', 6, {
        durationMs: Date.now() - extractionStartedAt
      });
      return validated.data;
    }

    // Fallback for models that return non-numeric emotion timeline values.
    const normalized = normalizeEmotionTimelineScores(parsed);
    const normalizedValidated = FullSignalsSchema.safeParse(normalized);
    if (!normalizedValidated.success) {
      this.emitStage('schema-validation', 'Schema Validated', 'failed', 6, {
        issues: normalizedValidated.error.issues.length
      });
      throw new OutputValidationError(
        'Model output failed full-signals schema validation',
        normalizedValidated.error.format()
      );
    }

    this.emitStage('schema-validation', 'Schema Validated', 'completed', 6, {
      durationMs: Date.now() - extractionStartedAt,
      normalizedFallback: true
    });
    return normalizedValidated.data;
  }

  private emitStage(
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

function normalizeEmotionTimelineScores(input: unknown): unknown {
  if (!input || typeof input !== 'object') {
    return input;
  }

  const root = input as Record<string, unknown>;
  const tone = root.tone;
  if (!tone || typeof tone !== 'object') {
    return input;
  }

  const toneObject = tone as Record<string, unknown>;
  const emotionTimeline = toneObject.emotion_timeline;
  if (!emotionTimeline || typeof emotionTimeline !== 'object') {
    return input;
  }

  const normalizedTimeline: Record<string, Record<string, number>> = {};
  for (const [bucket, value] of Object.entries(emotionTimeline as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') {
      continue;
    }

    const normalizedBucket: Record<string, number> = {};
    for (const [emotionName, score] of Object.entries(value as Record<string, unknown>)) {
      normalizedBucket[emotionName] = normalizeScore(score);
    }
    normalizedTimeline[bucket] = normalizedBucket;
  }

  return {
    ...root,
    tone: {
      ...toneObject,
      emotion_timeline: normalizedTimeline
    }
  };
}

function normalizeScore(score: unknown): number {
  if (typeof score === 'number' && Number.isFinite(score)) {
    return clampUnitScore(score);
  }

  if (typeof score === 'string') {
    const parsed = Number.parseFloat(score);
    if (Number.isFinite(parsed)) {
      return clampUnitScore(parsed);
    }
  }

  return 0;
}

function clampUnitScore(value: number): number {
  if (value > 1) {
    return 1;
  }
  if (value < -1) {
    return -1;
  }
  return value;
}
