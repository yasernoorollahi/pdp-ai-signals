import { z } from 'zod';
import { createSignalEnvelopeSchema } from './common.schema.js';

export const ToneDataSchema = z
  .object({
    sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']),
    mood: z.string(),
    motivation_level: z.enum(['low', 'medium', 'high']),
    effort_perception: z.enum(['low', 'medium', 'high']),
    friction_detected: z.boolean()
  })
  .strict();

export const ToneSignalSchema = createSignalEnvelopeSchema(ToneDataSchema);

export type ToneData = z.infer<typeof ToneDataSchema>;
export type ToneSignal = z.infer<typeof ToneSignalSchema>;
