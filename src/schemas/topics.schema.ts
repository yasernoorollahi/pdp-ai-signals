import { z } from 'zod';
import { createSignalEnvelopeSchema } from './common.schema.js';

export const TopicsDataSchema = z
  .object({
    topic_tags: z.array(z.string()),
    domain_classification: z.array(z.string())
  })
  .strict();

export const TopicsSignalSchema = createSignalEnvelopeSchema(TopicsDataSchema);

export type TopicsData = z.infer<typeof TopicsDataSchema>;
export type TopicsSignal = z.infer<typeof TopicsSignalSchema>;
