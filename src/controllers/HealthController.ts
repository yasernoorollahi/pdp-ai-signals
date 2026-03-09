import type { FastifyInstance } from 'fastify';

export class HealthController {
  public register(app: FastifyInstance): void {
    /**
     * @openapi
     * /health:
     *   get:
     *     tags: [System]
     *     summary: Health check
     *     responses:
     *       '200':
     *         description: Service is healthy
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HealthResponse'
     */
    app.get('/health', async (_request, reply) => {
      reply.status(200).send({ status: 'ok', service: 'pdp-ai-signal-service' });
    });
  }
}
