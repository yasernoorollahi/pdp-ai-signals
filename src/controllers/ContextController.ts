import type { FastifyInstance } from 'fastify';
import { parseExtractBody, toProviderOverrides } from './controllerUtils.js';
import { ExtractionServiceFactory } from '../services/ExtractionServiceFactory.js';

export class ContextController {
  constructor(private readonly extractionFactory: ExtractionServiceFactory) {}

  public register(app: FastifyInstance): void {
    /**
     * @openapi
     * /extract/context:
     *   post:
     *     tags: [Extraction]
     *     summary: Extract context signal
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ExtractRequest'
     *     responses:
     *       '200':
     *         description: Context signal
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ContextSignal'
     *       '400':
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       '422':
     *         description: Output validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       '502':
     *         description: Provider error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    app.post('/extract/context', async (request, reply) => {
      const { text, provider, model } = parseExtractBody(request.body);
      const service = this.extractionFactory.createContextService(toProviderOverrides({ provider, model }));
      const result = await service.extract(text);
      reply.status(200).send(result);
    });
  }
}
