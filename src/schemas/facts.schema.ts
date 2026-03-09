import { z } from 'zod';
import { createSignalEnvelopeSchema } from './common.schema.js';

export const FactsDataSchema = z
  .object({
    entities: z.array(z.string()),
    activities: z.array(z.string()),
    projects: z.array(z.string()),
    tools: z.array(z.string()),
    locations: z.array(z.string())
  })
  .strict();

export const FactsSignalSchema = createSignalEnvelopeSchema(FactsDataSchema);

export type FactsData = z.infer<typeof FactsDataSchema>;
export type FactsSignal = z.infer<typeof FactsSignalSchema>;
