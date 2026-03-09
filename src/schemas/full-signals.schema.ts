import { z } from 'zod';

const UnitScoreSchema = z.number().min(-1).max(1);
const PositiveUnitScoreSchema = z.number().min(0).max(1);

export const FullSignalsSchema = z
  .object({
    facts: z
      .object({
        actors: z
          .object({
            self: z.boolean(),
            romantic_partner: z.string(),
            peers: z.string()
          })
          .strict(),
        activities: z.array(z.string()),
        locations: z.array(z.string()),
        temporal_flow: z.array(z.string())
      })
      .strict(),
    intent: z
      .object({
        primary_intent: z.string(),
        secondary_intents: z.array(z.string()),
        internal_conflicts: z.array(
          z
            .object({
              conflict: z.string(),
              resolution: z.string()
            })
            .strict()
        ),
        core_drives: z.array(z.string())
      })
      .strict(),
    tone: z
      .object({
        overall_sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']),
        dominant_affective_arc: z.string(),
        emotion_timeline: z.record(z.string(), z.record(z.string(), UnitScoreSchema)),
        global_valence: UnitScoreSchema,
        global_arousal: PositiveUnitScoreSchema
      })
      .strict(),
    cognitive: z
      .object({
        patterns_detected: z.array(z.string()),
        cognitive_bias_risk: z.array(z.string()),
        clarity_level: z.enum(['low', 'medium', 'high']),
        metacognition_present: z.boolean()
      })
      .strict(),
    context: z
      .object({
        structural_stressors: z.array(z.string()),
        social_dynamics: z
          .object({
            gym_absence_effect: z.string(),
            missed_call_effect: z.string()
          })
          .strict(),
        resource_state: z
          .object({
            mental_energy: z.string(),
            time_pressure: z.string(),
            social_presence: z.string()
          })
          .strict()
      })
      .strict(),
    topics: z
      .object({
        primary_domains: z.array(z.string()),
        narrative_type: z.string()
      })
      .strict(),
    behavioral_modeling: z
      .object({
        energy_curve: z.array(PositiveUnitScoreSchema),
        motivation_curve: z.array(PositiveUnitScoreSchema),
        resilience_indicator: PositiveUnitScoreSchema,
        social_dependency_index: PositiveUnitScoreSchema
      })
      .strict(),
    confidence: PositiveUnitScoreSchema
  })
  .strict();

export type FullSignals = z.infer<typeof FullSignalsSchema>;
