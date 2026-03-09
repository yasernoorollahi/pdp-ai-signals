import { buildContextPrompt } from '../prompts/context.prompt.js';
import { ContextSignalSchema } from '../schemas/context.schema.js';
import { BaseExtractionService } from './BaseExtractionService.js';
import type { IContextExtractionService } from '../interfaces/IContextExtractionService.js';
import type { ContextData } from '../schemas/context.schema.js';
import type { IAIClientService } from '../interfaces/IAIClientService.js';

export class ContextExtractionService
  extends BaseExtractionService<ContextData>
  implements IContextExtractionService
{
  constructor(aiClient: IAIClientService) {
    super(aiClient, buildContextPrompt, ContextSignalSchema);
  }
}
