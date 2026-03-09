import type { IExtractionService } from './IExtractionService.js';
import type { TopicsData } from '../schemas/topics.schema.js';

export interface ITopicsExtractionService extends IExtractionService<TopicsData> {}
