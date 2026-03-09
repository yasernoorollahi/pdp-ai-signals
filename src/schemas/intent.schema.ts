import { z } from 'zod';
import { createSignalEnvelopeSchema } from './common.schema.js';

export const IntentDataSchema = z
  .object({
    goals: z.array(z.string()),
    plans: z.array(z.string()),
    commitments: z.array(z.string()),
    decisions: z.array(z.string()),
    obligations: z.array(z.string()),
    temporal_scope: z.string()
  })
  .strict();

export const IntentSignalSchema = createSignalEnvelopeSchema(IntentDataSchema);

export type IntentData = z.infer<typeof IntentDataSchema>;
export type IntentSignal = z.infer<typeof IntentSignalSchema>;
