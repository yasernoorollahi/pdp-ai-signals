import type { MessageClassificationResult } from '../schemas/message-classifier.schema.js';

export interface IMessageClassifierService {
  classify(text: string): Promise<MessageClassificationResult>;
}
