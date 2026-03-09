import type { FastifyInstance } from 'fastify';
import { parseExtractBody, toProviderOverrides } from './controllerUtils.js';
import { ExtractionServiceFactory } from '../services/ExtractionServiceFactory.js';

export class SignalsController {
  constructor(private readonly extractionFactory: ExtractionServiceFactory) {}

  public register(app: FastifyInstance): void {
    /**
     * @openapi
     * /extract/signals:
     *   post:
     *     tags: [Extraction]
     *     summary: Extract full signals payload
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ExtractRequest'
     *     responses:
     *       '200':
     *         description: Full signals payload
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/FullSignalsData'
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
    app.post('/extract/signals', async (request, reply) => {
      const { text, provider, model } = parseExtractBody(request.body);
      const service = this.extractionFactory.createFullSignalsService(toProviderOverrides({ provider, model }));
      const result = await service.extract(text);
      reply.status(200).send(result);
    });
  }
}
