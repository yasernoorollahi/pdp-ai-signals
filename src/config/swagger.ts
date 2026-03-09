import { resolve } from 'node:path';
import type { FastifyInstance } from 'fastify';
import fastifyExpress from '@fastify/express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

function buildSwaggerSpec(port: number) {
  const projectRoot = process.cwd();

  return swaggerJsdoc({
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'PDP AI Signal Service API',
        version: '1.0.0',
        description: 'Stateless cognitive signal extraction microservice'
      },
      servers: [
        {
          url: `http://localhost:${port}`
        }
      ],
      components: {
        schemas: {
          ExtractRequest: {
            type: 'object',
            additionalProperties: false,
            required: ['text'],
            properties: {
              text: { type: 'string', minLength: 1 },
              provider: { type: 'string', enum: ['openai', 'ollama', 'mock'] },
              model: { type: 'string', minLength: 1 }
            }
          },
          SignalMeta: {
            type: 'object',
            additionalProperties: false,
            required: ['language', 'model', 'confidence'],
            properties: {
              language: { type: 'string' },
              model: { type: 'string' },
              confidence: { type: 'number', minimum: 0, maximum: 1 }
            }
          },
          FactsData: {
            type: 'object',
            additionalProperties: false,
            required: ['entities', 'activities', 'projects', 'tools', 'locations'],
            properties: {
              entities: { type: 'array', items: { type: 'string' } },
              activities: { type: 'array', items: { type: 'string' } },
              projects: { type: 'array', items: { type: 'string' } },
              tools: { type: 'array', items: { type: 'string' } },
              locations: { type: 'array', items: { type: 'string' } }
            }
          },
          IntentData: {
            type: 'object',
            additionalProperties: false,
            required: ['goals', 'plans', 'commitments', 'decisions', 'obligations', 'temporal_scope'],
            properties: {
              goals: { type: 'array', items: { type: 'string' } },
              plans: { type: 'array', items: { type: 'string' } },
              commitments: { type: 'array', items: { type: 'string' } },
              decisions: { type: 'array', items: { type: 'string' } },
              obligations: { type: 'array', items: { type: 'string' } },
              temporal_scope: { type: 'string' }
            }
          },
          ToneData: {
            type: 'object',
            additionalProperties: false,
            required: ['sentiment', 'mood', 'motivation_level', 'effort_perception', 'friction_detected'],
            properties: {
              sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative', 'mixed'] },
              mood: { type: 'string' },
              motivation_level: { type: 'string', enum: ['low', 'medium', 'high'] },
              effort_perception: { type: 'string', enum: ['low', 'medium', 'high'] },
              friction_detected: { type: 'boolean' }
            }
          },
          CognitiveData: {
            type: 'object',
            additionalProperties: false,
            required: [
              'uncertainty_language',
              'confidence_language',
              'clarity_level',
              'decision_state',
              'hesitation_detected'
            ],
            properties: {
              uncertainty_language: { type: 'array', items: { type: 'string' } },
              confidence_language: { type: 'array', items: { type: 'string' } },
              clarity_level: { type: 'string', enum: ['low', 'medium', 'high'] },
              decision_state: { type: 'string', enum: ['undecided', 'considering', 'decided'] },
              hesitation_detected: { type: 'boolean' }
            }
          },
          ContextData: {
            type: 'object',
            additionalProperties: false,
            required: [
              'likes',
              'dislikes',
              'declared_avoidances',
              'time_constraints',
              'resource_constraints',
              'collaboration_detected'
            ],
            properties: {
              likes: { type: 'array', items: { type: 'string' } },
              dislikes: { type: 'array', items: { type: 'string' } },
              declared_avoidances: { type: 'array', items: { type: 'string' } },
              time_constraints: { type: 'array', items: { type: 'string' } },
              resource_constraints: { type: 'array', items: { type: 'string' } },
              collaboration_detected: { type: 'boolean' }
            }
          },
          TopicsData: {
            type: 'object',
            additionalProperties: false,
            required: ['topic_tags', 'domain_classification'],
            properties: {
              topic_tags: { type: 'array', items: { type: 'string' } },
              domain_classification: { type: 'array', items: { type: 'string' } }
            }
          },
          MessageClassificationResult: {
            type: 'object',
            additionalProperties: false,
            required: ['score', 'decision', 'reason'],
            properties: {
              score: { type: 'number', minimum: 0, maximum: 1 },
              decision: { type: 'string', enum: ['USEFUL', 'IGNORE'] },
              reason: { type: 'string', minLength: 1 }
            }
          },
          FullSignalsData: {
            type: 'object',
            additionalProperties: true
          },
          FactsSignal: {
            type: 'object',
            additionalProperties: false,
            required: ['meta', 'data'],
            properties: {
              meta: { $ref: '#/components/schemas/SignalMeta' },
              data: { $ref: '#/components/schemas/FactsData' }
            }
          },
          IntentSignal: {
            type: 'object',
            additionalProperties: false,
            required: ['meta', 'data'],
            properties: {
              meta: { $ref: '#/components/schemas/SignalMeta' },
              data: { $ref: '#/components/schemas/IntentData' }
            }
          },
          ToneSignal: {
            type: 'object',
            additionalProperties: false,
            required: ['meta', 'data'],
            properties: {
              meta: { $ref: '#/components/schemas/SignalMeta' },
              data: { $ref: '#/components/schemas/ToneData' }
            }
          },
          CognitiveSignal: {
            type: 'object',
            additionalProperties: false,
            required: ['meta', 'data'],
            properties: {
              meta: { $ref: '#/components/schemas/SignalMeta' },
              data: { $ref: '#/components/schemas/CognitiveData' }
            }
          },
          ContextSignal: {
            type: 'object',
            additionalProperties: false,
            required: ['meta', 'data'],
            properties: {
              meta: { $ref: '#/components/schemas/SignalMeta' },
              data: { $ref: '#/components/schemas/ContextData' }
            }
          },
          TopicsSignal: {
            type: 'object',
            additionalProperties: false,
            required: ['meta', 'data'],
            properties: {
              meta: { $ref: '#/components/schemas/SignalMeta' },
              data: { $ref: '#/components/schemas/TopicsData' }
            }
          },
          ModelListResponse: {
            type: 'object',
            additionalProperties: false,
            required: ['provider', 'models', 'defaultModel'],
            properties: {
              provider: { type: 'string', enum: ['openai', 'ollama'] },
              models: { type: 'array', items: { type: 'string' } },
              defaultModel: { type: ['string', 'null'] },
              warning: { type: 'string' }
            }
          },
          HealthResponse: {
            type: 'object',
            additionalProperties: false,
            required: ['status', 'service'],
            properties: {
              status: { type: 'string', example: 'ok' },
              service: { type: 'string', example: 'pdp-ai-signal-service' }
            }
          },
          ErrorResponse: {
            type: 'object',
            additionalProperties: false,
            required: ['error'],
            properties: {
              error: {
                type: 'object',
                required: ['code', 'message', 'details'],
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                  details: {}
                }
              }
            }
          }
        }
      }
    },
    apis: [
      resolve(projectRoot, 'src/controllers/*.ts'),
      resolve(projectRoot, 'dist/controllers/*.js')
    ]
  });
}

export async function registerSwagger(app: FastifyInstance, port: number): Promise<void> {
  const swaggerSpec = buildSwaggerSpec(port);
  const swaggerHtml = swaggerUi.generateHTML(swaggerSpec);

  await app.register(fastifyExpress);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs', async (_request, reply) => {
    reply.type('text/html').send(swaggerHtml);
  });
  app.get('/api-docs/', async (_request, reply) => {
    reply.type('text/html').send(swaggerHtml);
  });
  app.get('/api-docs.json', async () => swaggerSpec);
}
