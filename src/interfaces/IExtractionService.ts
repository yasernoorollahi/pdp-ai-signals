import type { SignalEnvelope } from './SignalEnvelope.js';

export interface IExtractionService<TData> {
  extract(text: string): Promise<SignalEnvelope<TData>>;
}
