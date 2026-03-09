import { buildTopicsPrompt } from '../prompts/topics.prompt.js';
import { TopicsSignalSchema } from '../schemas/topics.schema.js';
import { BaseExtractionService } from './BaseExtractionService.js';
import type { ITopicsExtractionService } from '../interfaces/ITopicsExtractionService.js';
import type { TopicsData } from '../schemas/topics.schema.js';
import type { IAIClientService } from '../interfaces/IAIClientService.js';

export class TopicsExtractionService
  extends BaseExtractionService<TopicsData>
  implements ITopicsExtractionService
{
  constructor(aiClient: IAIClientService) {
    super(aiClient, buildTopicsPrompt, TopicsSignalSchema);
  }
}
