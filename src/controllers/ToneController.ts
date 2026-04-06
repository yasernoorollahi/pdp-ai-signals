import type { FastifyInstance } from 'fastify';
import { parseExtractBody, toProviderOverrides, traceExtractionRequest } from './controllerUtils.js';
import { ExtractionServiceFactory } from '../services/ExtractionServiceFactory.js';
import type { LiveRequestMonitor } from '../utils/liveRequestMonitor.js';

export class ToneController {
  constructor(
    private readonly extractionFactory: ExtractionServiceFactory,
    private readonly liveRequestMonitor: LiveRequestMonitor
  ) {}

  public register(app: FastifyInstance): void {
    /**
     * @openapi
     * /extract/tone:
     *   post:
     *     tags: [Extraction]
     *     summary: Extract tone signal
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ExtractRequest'
     *     responses:
     *       '200':
     *         description: Tone signal
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ToneSignal'
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
    app.post('/extract/tone', async (request, reply) => {
      const { text, provider, model } = parseExtractBody(request.body);
      const trace = traceExtractionRequest(request, this.liveRequestMonitor, { provider, model });
      const service = this.extractionFactory.createToneService(toProviderOverrides({ provider, model }), trace);
      const result = await service.extract(text);
      reply.status(200).send(result);
    });
  }
}
