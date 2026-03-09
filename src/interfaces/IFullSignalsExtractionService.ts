import type { FullSignals } from '../schemas/full-signals.schema.js';

export interface IFullSignalsExtractionService {
  extract(text: string): Promise<FullSignals>;
}
