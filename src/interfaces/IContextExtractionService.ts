import type { IExtractionService } from './IExtractionService.js';
import type { ContextData } from '../schemas/context.schema.js';

export interface IContextExtractionService extends IExtractionService<ContextData> {}
