import type { IExtractionService } from './IExtractionService.js';
import type { ToneData } from '../schemas/tone.schema.js';

export interface IToneExtractionService extends IExtractionService<ToneData> {}
