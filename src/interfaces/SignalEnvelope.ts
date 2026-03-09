export interface SignalMeta {
  language: string;
  model: string;
  confidence: number;
}

export interface SignalEnvelope<TData> {
  meta: SignalMeta;
  data: TData;
}
