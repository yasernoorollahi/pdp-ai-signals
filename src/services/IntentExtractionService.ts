import { buildIntentPrompt } from '../prompts/intent.prompt.js';
import { IntentSignalSchema } from '../schemas/intent.schema.js';
import { BaseExtractionService } from './BaseExtractionService.js';
import type { IIntentExtractionService } from '../interfaces/IIntentExtractionService.js';
import type { IntentData } from '../schemas/intent.schema.js';
import type { IAIClientService } from '../interfaces/IAIClientService.js';

export class IntentExtractionService
  extends BaseExtractionService<IntentData>
  implements IIntentExtractionService
{
  constructor(aiClient: IAIClientService) {
    super(aiClient, buildIntentPrompt, IntentSignalSchema);
  }
}
