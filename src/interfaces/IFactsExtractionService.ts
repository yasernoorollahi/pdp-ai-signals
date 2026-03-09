import type { IExtractionService } from './IExtractionService.js';
import type { FactsData } from '../schemas/facts.schema.js';

export interface IFactsExtractionService extends IExtractionService<FactsData> {}
