import { z } from 'zod';
import { createSignalEnvelopeSchema } from './common.schema.js';

export const ContextDataSchema = z
  .object({
    likes: z.array(z.string()),
    dislikes: z.array(z.string()),
    declared_avoidances: z.array(z.string()),
    time_constraints: z.array(z.string()),
    resource_constraints: z.array(z.string()),
    collaboration_detected: z.boolean()
  })
  .strict();

export const ContextSignalSchema = createSignalEnvelopeSchema(ContextDataSchema);

export type ContextData = z.infer<typeof ContextDataSchema>;
export type ContextSignal = z.infer<typeof ContextSignalSchema>;
