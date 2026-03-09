import { z } from 'zod';
import type { IExtractionService } from '../interfaces/IExtractionService.js';
import type { IAIClientService } from '../interfaces/IAIClientService.js';
import type { SignalEnvelope } from '../interfaces/SignalEnvelope.js';
import { parseStrictJson } from '../utils/parseJson.js';
import { OutputValidationError } from '../utils/errors.js';

export abstract class BaseExtractionService<TData> implements IExtractionService<TData> {
  constructor(
    private readonly aiClient: IAIClientService,
    private readonly promptBuilder: (text: string) => string,
    private readonly envelopeSchema: z.ZodSchema<{ meta: { language: string; confidence: number }; data: TData }>
  ) {}

  public async extract(text: string): Promise<SignalEnvelope<TData>> {
    const prompt = this.promptBuilder(text);
    const raw = await this.aiClient.generate(prompt);
    const parsed = parseStrictJson(raw);
    const normalized = this.normalizeParsedOutput(parsed);
    const validated = this.envelopeSchema.safeParse(normalized);

    if (!validated.success) {
      throw new OutputValidationError('Model output failed schema validation', validated.error.format());
    }

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
}
