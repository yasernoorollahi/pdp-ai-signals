import { buildFullSignalsPrompt } from '../prompts/full-signals.prompt.js';
import type { IAIClientService } from '../interfaces/IAIClientService.js';
import type { IFullSignalsExtractionService } from '../interfaces/IFullSignalsExtractionService.js';
import { parseStrictJson } from '../utils/parseJson.js';
import { OutputValidationError } from '../utils/errors.js';
import { FullSignalsSchema, type FullSignals } from '../schemas/full-signals.schema.js';

export class FullSignalsExtractionService implements IFullSignalsExtractionService {
  constructor(private readonly aiClient: IAIClientService) {}

  public async extract(text: string): Promise<FullSignals> {
    const prompt = buildFullSignalsPrompt(text);
    const raw = await this.aiClient.generate(prompt);
    const parsed = parseStrictJson(raw);
    const validated = FullSignalsSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data;
    }

    // Fallback for models that return non-numeric emotion timeline values.
    const normalized = normalizeEmotionTimelineScores(parsed);
    const normalizedValidated = FullSignalsSchema.safeParse(normalized);
    if (!normalizedValidated.success) {
      throw new OutputValidationError(
        'Model output failed full-signals schema validation',
        normalizedValidated.error.format()
      );
    }

    return normalizedValidated.data;
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
