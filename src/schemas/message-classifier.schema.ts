import { z } from 'zod';

export const MessageClassificationDecisionSchema = z.enum(['USEFUL', 'IGNORE']);

export const MessageClassificationResultSchema = z
  .object({
    score: z.number().min(0).max(1),
    decision: MessageClassificationDecisionSchema,
    reason: z.string().trim().min(1)
  })
  .strict();

export type MessageClassificationDecision = z.infer<typeof MessageClassificationDecisionSchema>;
export type MessageClassificationResult = z.infer<typeof MessageClassificationResultSchema>;
