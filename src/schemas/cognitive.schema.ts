import { z } from 'zod';
import { createSignalEnvelopeSchema } from './common.schema.js';

export const CognitiveDataSchema = z
  .object({
    uncertainty_language: z.array(z.string()),
    confidence_language: z.array(z.string()),
    clarity_level: z.enum(['low', 'medium', 'high']),
    decision_state: z.enum(['undecided', 'considering', 'decided']),
    hesitation_detected: z.boolean()
  })
  .strict();

export const CognitiveSignalSchema = createSignalEnvelopeSchema(CognitiveDataSchema);

export type CognitiveData = z.infer<typeof CognitiveDataSchema>;
export type CognitiveSignal = z.infer<typeof CognitiveSignalSchema>;
