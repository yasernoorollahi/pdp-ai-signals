import type { AIProvider } from './AIProvider.js';

export class MockProvider implements AIProvider {
  public getModelName(): string {
    return 'mock-llm';
  }

  public async generate(prompt: string): Promise<string> {
    const language = /[\u0600-\u06FF]/.test(prompt) ? 'fa' : 'en';

    if (prompt.includes('CAPABILITY: full_signals')) {
      return JSON.stringify({
        facts: {
          actors: {
            self: true,
            romantic_partner: 'girlfriend',
            peers: 'gym friends'
          },
          activities: [
            'morning exercise',
            'making breakfast',
            'remote work',
            'intensive meetings',
            'ordering food',
            'gym workout',
            'attempted phone call'
          ],
          locations: ['home', 'gym'],
          temporal_flow: ['morning', 'midday', 'afternoon', 'evening', 'night']
        },
        intent: {
          primary_intent: 'self_reflection',
          secondary_intents: ['self_regulation', 'emotional_connection'],
          internal_conflicts: [
            {
              conflict: 'go_to_gym_vs_rest',
              resolution: 'chose_long_term_reward'
            }
          ],
          core_drives: ['discipline', 'competence', 'belonging']
        },
        tone: {
          overall_sentiment: 'mixed',
          dominant_affective_arc: 'positive_to_depletion',
          emotion_timeline: {
            morning: {
              motivation: 0.8,
              confidence: 0.75,
              valence: 0.7,
              energy: 0.9
            },
            midday: {
              irritation: 0.6,
              fatigue: 0.5,
              valence: -0.2,
              energy: 0.5
            },
            afternoon: {
              exhaustion: 0.8,
              valence: -0.4,
              energy: 0.3
            },
            night: {
              loneliness: 0.75,
              disappointment: 0.6,
              overthinking: 0.7,
              valence: -0.5,
              energy: 0.2
            }
          },
          global_valence: -0.15,
          global_arousal: 0.55
        },
        cognitive: {
          patterns_detected: [
            'emotional_contrast',
            'effort_reward_imbalance',
            'minor_event_magnification_under_fatigue',
            'social_dependency_awareness',
            'end_of_day_rumination'
          ],
          cognitive_bias_risk: ['fatigue_amplification', 'expectation_attachment'],
          clarity_level: 'high',
          metacognition_present: true
        },
        context: {
          structural_stressors: [
            'remote_work_boundary_blur',
            'back_to_back_meetings',
            'energy_depletion_cycle'
          ],
          social_dynamics: {
            gym_absence_effect: 'reduced_mood',
            missed_call_effect: 'connection_unmet'
          },
          resource_state: {
            mental_energy: 'depleted_by_evening',
            time_pressure: 'moderate',
            social_presence: 'low_at_night'
          }
        },
        topics: {
          primary_domains: [
            'self_discipline',
            'work_stress',
            'energy_management',
            'loneliness',
            'daily_emotional_variability'
          ],
          narrative_type: 'human_variability_reflection'
        },
        behavioral_modeling: {
          energy_curve: [0.9, 0.5, 0.3, 0.2],
          motivation_curve: [0.8, 0.6, 0.4, 0.3],
          resilience_indicator: 0.78,
          social_dependency_index: 0.72
        },
        confidence: 0.93
      });
    }

    if (prompt.includes('CAPABILITY: message_classification')) {
      return JSON.stringify({
        score: 0.82,
        decision: 'USEFUL',
        reason: 'User message includes events and actionable context'
      });
    }

    if (prompt.includes('CAPABILITY: facts')) {
      return JSON.stringify({
        meta: { language, confidence: 0.85 },
        data: {
          entities: [],
          activities: [],
          projects: [],
          tools: [],
          locations: []
        }
      });
    }

    if (prompt.includes('CAPABILITY: intent')) {
      return JSON.stringify({
        meta: { language, confidence: 0.84 },
        data: {
          goals: [],
          plans: [],
          commitments: [],
          decisions: [],
          obligations: [],
          temporal_scope: 'unknown'
        }
      });
    }

    if (prompt.includes('CAPABILITY: tone')) {
      return JSON.stringify({
        meta: { language, confidence: 0.8 },
        data: {
          sentiment: 'neutral',
          mood: 'neutral',
          motivation_level: 'medium',
          effort_perception: 'medium',
          friction_detected: false
        }
      });
    }

    if (prompt.includes('CAPABILITY: cognitive')) {
      return JSON.stringify({
        meta: { language, confidence: 0.81 },
        data: {
          uncertainty_language: [],
          confidence_language: [],
          clarity_level: 'medium',
          decision_state: 'considering',
          hesitation_detected: false
        }
      });
    }

    if (prompt.includes('CAPABILITY: context')) {
      return JSON.stringify({
        meta: { language, confidence: 0.79 },
        data: {
          likes: [],
          dislikes: [],
          declared_avoidances: [],
          time_constraints: [],
          resource_constraints: [],
          collaboration_detected: false
        }
      });
    }

    if (prompt.includes('CAPABILITY: topics')) {
      return JSON.stringify({
        meta: { language, confidence: 0.78 },
        data: {
          topic_tags: [],
          domain_classification: []
        }
      });
    }

    return JSON.stringify({
      meta: { language, confidence: 0.5 },
      data: {}
    });
  }
}
