import { buildCognitivePrompt } from '../prompts/cognitive.prompt.js';
import { CognitiveSignalSchema } from '../schemas/cognitive.schema.js';
import { BaseExtractionService } from './BaseExtractionService.js';
import type { ICognitiveExtractionService } from '../interfaces/ICognitiveExtractionService.js';
import type { CognitiveData } from '../schemas/cognitive.schema.js';
import type { IAIClientService } from '../interfaces/IAIClientService.js';

export class CognitiveExtractionService
  extends BaseExtractionService<CognitiveData>
  implements ICognitiveExtractionService
{
  constructor(aiClient: IAIClientService) {
    super(aiClient, buildCognitivePrompt, CognitiveSignalSchema);
  }
}
