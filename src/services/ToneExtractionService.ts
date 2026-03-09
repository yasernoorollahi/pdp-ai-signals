import { buildTonePrompt } from '../prompts/tone.prompt.js';
import { ToneSignalSchema } from '../schemas/tone.schema.js';
import { BaseExtractionService } from './BaseExtractionService.js';
import type { IToneExtractionService } from '../interfaces/IToneExtractionService.js';
import type { ToneData } from '../schemas/tone.schema.js';
import type { IAIClientService } from '../interfaces/IAIClientService.js';

export class ToneExtractionService
  extends BaseExtractionService<ToneData>
  implements IToneExtractionService
{
  constructor(aiClient: IAIClientService) {
    super(aiClient, buildTonePrompt, ToneSignalSchema);
  }

  protected override normalizeParsedOutput(parsed: unknown): unknown {
    if (!parsed || typeof parsed !== 'object') {
      return parsed;
    }

    const root = parsed as Record<string, unknown>;
    const meta = root.meta && typeof root.meta === 'object' ? (root.meta as Record<string, unknown>) : undefined;
    const data = root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : undefined;

    if (!meta || !data) {
      return parsed;
    }

    const sentiment = this.normalizeEnum(
      data.sentiment,
      ['positive', 'neutral', 'negative', 'mixed'],
      'neutral'
    );
    const motivationLevel = this.normalizeEnum(
      data.motivation_level ?? data.motivationLevel,
      ['low', 'medium', 'high'],
      'medium'
    );
    const effortPerception = this.normalizeEnum(
      data.effort_perception ?? data.effortPerception,
      ['low', 'medium', 'high'],
      'medium'
    );
    const frictionDetected = this.normalizeBoolean(
      data.friction_detected ?? data.frictionDetected,
      false
    );
    const mood = typeof data.mood === 'string' && data.mood.trim().length > 0 ? data.mood.trim() : 'unknown';

    return {
      ...root,
      meta: {
        ...meta,
        language: typeof meta.language === 'string' ? meta.language : 'unknown',
        confidence: this.normalizeConfidence(meta.confidence)
      },
      data: {
        ...data,
        sentiment,
        mood,
        motivation_level: motivationLevel,
        effort_perception: effortPerception,
        friction_detected: frictionDetected
      }
    };
  }

  private normalizeEnum<TValue extends string>(
    value: unknown,
    allowed: readonly TValue[],
    fallback: TValue
  ): TValue {
    if (typeof value !== 'string') {
      return fallback;
    }

    const normalized = value.trim().toLowerCase().replace(/\s+/g, '_') as TValue;
    if (allowed.includes(normalized)) {
      return normalized;
    }
    return fallback;
  }

  private normalizeBoolean(value: unknown, fallback: boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
    return fallback;
  }

  private normalizeConfidence(value: unknown): number {
    if (typeof value === 'number') {
      if (value < 0) return 0;
      if (value > 1) return 1;
      return value;
    }
    return 0.5;
  }
}
