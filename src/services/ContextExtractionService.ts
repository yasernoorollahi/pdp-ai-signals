import { buildContextPrompt } from '../prompts/context.prompt.js';
import { ContextSignalSchema } from '../schemas/context.schema.js';
import { BaseExtractionService } from './BaseExtractionService.js';
import type { IContextExtractionService } from '../interfaces/IContextExtractionService.js';
import type { ContextData } from '../schemas/context.schema.js';
import type { IAIClientService } from '../interfaces/IAIClientService.js';
import type { LiveRequestMonitor } from '../utils/liveRequestMonitor.js';
import type { RequestTraceContext } from '../interfaces/RequestTraceContext.js';

export class ContextExtractionService
  extends BaseExtractionService<ContextData>
  implements IContextExtractionService
{
  constructor(aiClient: IAIClientService, liveRequestMonitor?: LiveRequestMonitor, trace?: RequestTraceContext) {
    super(aiClient, buildContextPrompt, ContextSignalSchema, liveRequestMonitor, trace);
  }
}
