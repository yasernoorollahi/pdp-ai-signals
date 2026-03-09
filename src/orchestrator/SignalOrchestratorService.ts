import type { IOrchestratorService, CombinedSignals } from '../interfaces/IOrchestratorService.js';
import type { IFactsExtractionService } from '../interfaces/IFactsExtractionService.js';
import type { IIntentExtractionService } from '../interfaces/IIntentExtractionService.js';
import type { IToneExtractionService } from '../interfaces/IToneExtractionService.js';
import type { ICognitiveExtractionService } from '../interfaces/ICognitiveExtractionService.js';
import type { IContextExtractionService } from '../interfaces/IContextExtractionService.js';
import type { ITopicsExtractionService } from '../interfaces/ITopicsExtractionService.js';

export class SignalOrchestratorService implements IOrchestratorService {
  constructor(
    private readonly factsService: IFactsExtractionService,
    private readonly intentService: IIntentExtractionService,
    private readonly toneService: IToneExtractionService,
    private readonly cognitiveService: ICognitiveExtractionService,
    private readonly contextService: IContextExtractionService,
    private readonly topicsService: ITopicsExtractionService
  ) {}

  public async extractAll(text: string): Promise<CombinedSignals> {
    const facts = await this.factsService.extract(text);
    const intent = await this.intentService.extract(text);
    const tone = await this.toneService.extract(text);
    const cognitive = await this.cognitiveService.extract(text);
    const context = await this.contextService.extract(text);
    const topics = await this.topicsService.extract(text);

    const confidence =
      (facts.meta.confidence +
        intent.meta.confidence +
        tone.meta.confidence +
        cognitive.meta.confidence +
        context.meta.confidence +
        topics.meta.confidence) /
      6;

    return {
      meta: {
        language: facts.meta.language,
        model: facts.meta.model,
        confidence: Number(confidence.toFixed(4))
      },
      data: {
        facts: facts.data,
        intent: intent.data,
        tone: tone.data,
        cognitive: cognitive.data,
        context: context.data,
        topics: topics.data
      }
    };
  }
}
