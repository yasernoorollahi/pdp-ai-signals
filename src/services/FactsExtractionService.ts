import { buildFactsPrompt } from '../prompts/facts.prompt.js';
import { FactsSignalSchema } from '../schemas/facts.schema.js';
import { BaseExtractionService } from './BaseExtractionService.js';
import type { IFactsExtractionService } from '../interfaces/IFactsExtractionService.js';
import type { FactsData } from '../schemas/facts.schema.js';
import type { IAIClientService } from '../interfaces/IAIClientService.js';
import type { LiveRequestMonitor } from '../utils/liveRequestMonitor.js';
import type { RequestTraceContext } from '../interfaces/RequestTraceContext.js';

export class FactsExtractionService
  extends BaseExtractionService<FactsData>
  implements IFactsExtractionService
{
  constructor(aiClient: IAIClientService, liveRequestMonitor?: LiveRequestMonitor, trace?: RequestTraceContext) {
    super(aiClient, buildFactsPrompt, FactsSignalSchema, liveRequestMonitor, trace);
  }
}
