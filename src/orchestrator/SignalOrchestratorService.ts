import type { IOrchestratorService, CombinedSignals } from '../interfaces/IOrchestratorService.js';
import type { IFactsExtractionService } from '../interfaces/IFactsExtractionService.js';
import type { IIntentExtractionService } from '../interfaces/IIntentExtractionService.js';
import type { IToneExtractionService } from '../interfaces/IToneExtractionService.js';
import type { ICognitiveExtractionService } from '../interfaces/ICognitiveExtractionService.js';
import type { IContextExtractionService } from '../interfaces/IContextExtractionService.js';
import type { ITopicsExtractionService } from '../interfaces/ITopicsExtractionService.js';
import type { LiveRequestMonitor } from '../utils/liveRequestMonitor.js';
import type { RequestTraceContext } from '../interfaces/RequestTraceContext.js';
import { emitTraceStage } from '../utils/requestTracing.js';

export class SignalOrchestratorService implements IOrchestratorService {
  constructor(
    private readonly factsService: IFactsExtractionService,
    private readonly intentService: IIntentExtractionService,
    private readonly toneService: IToneExtractionService,
    private readonly cognitiveService: ICognitiveExtractionService,
    private readonly contextService: IContextExtractionService,
    private readonly topicsService: ITopicsExtractionService,
    private readonly liveRequestMonitor?: LiveRequestMonitor,
    private readonly trace?: RequestTraceContext
  ) {}

  public async extractAll(text: string): Promise<CombinedSignals> {
    this.emitStep('facts', 'Facts', 'started', 3);
    const facts = await this.factsService.extract(text);
    this.emitStep('facts', 'Facts', 'completed', 3);
    this.emitStep('intent', 'Intent', 'started', 4);
    const intent = await this.intentService.extract(text);
    this.emitStep('intent', 'Intent', 'completed', 4);
    this.emitStep('tone', 'Tone', 'started', 5);
    const tone = await this.toneService.extract(text);
    this.emitStep('tone', 'Tone', 'completed', 5);
    this.emitStep('cognitive', 'Cognitive', 'started', 6);
    const cognitive = await this.cognitiveService.extract(text);
    this.emitStep('cognitive', 'Cognitive', 'completed', 6);
    this.emitStep('context', 'Context', 'started', 7);
    const context = await this.contextService.extract(text);
    this.emitStep('context', 'Context', 'completed', 7);
    this.emitStep('topics', 'Topics', 'started', 8);
    const topics = await this.topicsService.extract(text);
    this.emitStep('topics', 'Topics', 'completed', 8);

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

  private emitStep(
    stageKey: string,
    label: string,
    status: 'started' | 'completed' | 'failed',
    order: number
  ): void {
    if (!this.liveRequestMonitor || !this.trace) {
      return;
    }

    emitTraceStage(this.liveRequestMonitor, this.trace, `orchestrator-${stageKey}`, `Pipeline ${label}`, status, {
      order
    });
  }
}
