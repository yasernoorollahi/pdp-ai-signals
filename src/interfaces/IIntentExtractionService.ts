import type { IExtractionService } from './IExtractionService.js';
import type { IntentData } from '../schemas/intent.schema.js';

export interface IIntentExtractionService extends IExtractionService<IntentData> {}
