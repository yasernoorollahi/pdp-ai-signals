import type { IExtractionService } from './IExtractionService.js';
import type { CognitiveData } from '../schemas/cognitive.schema.js';

export interface ICognitiveExtractionService extends IExtractionService<CognitiveData> {}
