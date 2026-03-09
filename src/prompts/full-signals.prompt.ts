function escapeInput(text: string): string {
  return text.replace(/```/g, '');
}

const FULL_SIGNALS_CONTRACT = `{
  "facts": {
    "actors": {
      "self": true,
      "romantic_partner": "string",
      "peers": "string"
    },
    "activities": ["string"],
    "locations": ["string"],
    "temporal_flow": ["string"]
  },
  "intent": {
    "primary_intent": "string",
    "secondary_intents": ["string"],
    "internal_conflicts": [
      {
        "conflict": "string",
        "resolution": "string"
      }
    ],
    "core_drives": ["string"]
  },
  "tone": {
    "overall_sentiment": "positive|neutral|negative|mixed",
    "dominant_affective_arc": "string",
    "emotion_timeline": {
      "morning": {
        "emotion_name": 0.0,
        "valence": 0.0,
        "energy": 0.0
      }
    },
    "global_valence": 0.0,
    "global_arousal": 0.0
  },
  "cognitive": {
    "patterns_detected": ["string"],
    "cognitive_bias_risk": ["string"],
    "clarity_level": "low|medium|high",
    "metacognition_present": true
  },
  "context": {
    "structural_stressors": ["string"],
    "social_dynamics": {
      "gym_absence_effect": "string",
      "missed_call_effect": "string"
    },
    "resource_state": {
      "mental_energy": "string",
      "time_pressure": "string",
      "social_presence": "string"
    }
  },
  "topics": {
    "primary_domains": ["string"],
    "narrative_type": "string"
  },
  "behavioral_modeling": {
    "energy_curve": [0.0],
    "motivation_curve": [0.0],
    "resilience_indicator": 0.0,
    "social_dependency_index": 0.0
  },
  "confidence": 0.0
}`;

export function buildFullSignalsPrompt(inputText: string): string {
  return `CAPABILITY: full_signals
You are an advanced cognitive signal extractor.
Rules:
1) Output must be strict JSON only, no prose, no markdown.
2) Use the exact top-level keys and structure in the required schema.
3) Use normalized snake_case labels where semantic categories are needed.
4) Scores must be numbers in range [-1, 1] for valence-like values and [0, 1] for confidence/arousal/indices.
5) Infer carefully from provided text and avoid adding unsupported entities.
6) Return a fully populated object with realistic, internally consistent values.

Required JSON schema:
${FULL_SIGNALS_CONTRACT}

Input text:
${escapeInput(inputText)}`;
}
