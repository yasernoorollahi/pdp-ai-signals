import { z } from 'zod';

export const ProviderSchema = z.enum(['openai', 'ollama', 'mock']);

export const ExtractRequestSchema = z
  .object({
    text: z.string().trim().min(1, 'text is required'),
    provider: ProviderSchema.optional(),
    model: z.string().trim().min(1).optional()
  })
  .strict();

const MetaInputSchema = z
  .object({
    language: z.string().trim().min(2),
    confidence: z.number().min(0).max(1)
  })
  .strict();

export function createSignalEnvelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z
    .object({
      meta: MetaInputSchema,
      data: dataSchema
    })
    .strict();
}
