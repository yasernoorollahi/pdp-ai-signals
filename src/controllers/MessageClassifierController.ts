import type { FastifyInstance } from 'fastify';
import { parseExtractBody, toProviderOverrides, traceExtractionRequest } from './controllerUtils.js';
import { ExtractionServiceFactory } from '../services/ExtractionServiceFactory.js';
import type { LiveRequestMonitor } from '../utils/liveRequestMonitor.js';

export class MessageClassifierController {
  constructor(
    private readonly extractionFactory: ExtractionServiceFactory,
    private readonly liveRequestMonitor: LiveRequestMonitor
  ) {}

  public register(app: FastifyInstance): void {
    /**
     * @openapi
     * /extract/classify:
     *   post:
     *     tags: [Extraction]
     *     summary: Classify whether a message is useful for deeper extraction
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ExtractRequest'
     *     responses:
     *       '200':
     *         description: Message classification result
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageClassificationResult'
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
    app.post('/extract/classify', async (request, reply) => {
      const { text, provider, model } = parseExtractBody(request.body);
      request.log.info(
        { provider: provider ?? null, model: model ?? null, textLength: text.length },
        'message classification started'
      );

      const trace = traceExtractionRequest(request, this.liveRequestMonitor, { provider, model });
      const service = this.extractionFactory.createMessageClassifierService(toProviderOverrides({ provider, model }), trace);
      const result = await service.classify(text);

      request.log.info(
        { score: result.score, decision: result.decision },
        'message classification completed'
      );
      reply.status(200).send(result);
    });
  }
}
