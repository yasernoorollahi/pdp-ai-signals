import { buildIntentPrompt } from '../prompts/intent.prompt.js';
import { IntentSignalSchema } from '../schemas/intent.schema.js';
import { BaseExtractionService } from './BaseExtractionService.js';
import type { IIntentExtractionService } from '../interfaces/IIntentExtractionService.js';
import type { IntentData } from '../schemas/intent.schema.js';
import type { IAIClientService } from '../interfaces/IAIClientService.js';
import type { LiveRequestMonitor } from '../utils/liveRequestMonitor.js';
import type { RequestTraceContext } from '../interfaces/RequestTraceContext.js';

export class IntentExtractionService
  extends BaseExtractionService<IntentData>
  implements IIntentExtractionService
{
  constructor(aiClient: IAIClientService, liveRequestMonitor?: LiveRequestMonitor, trace?: RequestTraceContext) {
    super(aiClient, buildIntentPrompt, IntentSignalSchema, liveRequestMonitor, trace);
  }
}
