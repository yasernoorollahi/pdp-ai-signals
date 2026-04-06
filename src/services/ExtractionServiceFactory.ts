import type { AppConfig } from '../config/env.js';
import { createProvider, type ProviderOverrides } from '../config/providerFactory.js';
import { SignalOrchestratorService } from '../orchestrator/SignalOrchestratorService.js';
import { CognitiveExtractionService } from './CognitiveExtractionService.js';
import { ContextExtractionService } from './ContextExtractionService.js';
import { FactsExtractionService } from './FactsExtractionService.js';
import { IntentExtractionService } from './IntentExtractionService.js';
import { TopicsExtractionService } from './TopicsExtractionService.js';
import { ToneExtractionService } from './ToneExtractionService.js';
import { AIClientService } from './AIClientService.js';
import { FullSignalsExtractionService } from './FullSignalsExtractionService.js';
import { MessageClassifierService } from './MessageClassifierService.js';
import type { LiveRequestMonitor } from '../utils/liveRequestMonitor.js';
import type { RequestTraceContext } from '../interfaces/RequestTraceContext.js';

export class ExtractionServiceFactory {
  constructor(
    private readonly config: AppConfig,
    private readonly liveRequestMonitor?: LiveRequestMonitor
  ) {}

  public createFactsService(overrides?: ProviderOverrides, trace?: RequestTraceContext): FactsExtractionService {
    return new FactsExtractionService(this.createAIClientService(overrides, trace), this.liveRequestMonitor, trace);
  }

  public createIntentService(overrides?: ProviderOverrides, trace?: RequestTraceContext): IntentExtractionService {
    return new IntentExtractionService(this.createAIClientService(overrides, trace), this.liveRequestMonitor, trace);
  }

  public createToneService(overrides?: ProviderOverrides, trace?: RequestTraceContext): ToneExtractionService {
    return new ToneExtractionService(this.createAIClientService(overrides, trace), this.liveRequestMonitor, trace);
  }

  public createCognitiveService(
    overrides?: ProviderOverrides,
    trace?: RequestTraceContext
  ): CognitiveExtractionService {
    return new CognitiveExtractionService(this.createAIClientService(overrides, trace), this.liveRequestMonitor, trace);
  }

  public createContextService(overrides?: ProviderOverrides, trace?: RequestTraceContext): ContextExtractionService {
    return new ContextExtractionService(this.createAIClientService(overrides, trace), this.liveRequestMonitor, trace);
  }

  public createTopicsService(overrides?: ProviderOverrides, trace?: RequestTraceContext): TopicsExtractionService {
    return new TopicsExtractionService(this.createAIClientService(overrides, trace), this.liveRequestMonitor, trace);
  }

  public createOrchestratorService(overrides?: ProviderOverrides, trace?: RequestTraceContext): SignalOrchestratorService {
    return new SignalOrchestratorService(
      this.createFactsService(overrides, trace),
      this.createIntentService(overrides, trace),
      this.createToneService(overrides, trace),
      this.createCognitiveService(overrides, trace),
      this.createContextService(overrides, trace),
      this.createTopicsService(overrides, trace),
      this.liveRequestMonitor,
      trace
    );
  }

  public createFullSignalsService(
    overrides?: ProviderOverrides,
    trace?: RequestTraceContext
  ): FullSignalsExtractionService {
    return new FullSignalsExtractionService(this.createAIClientService(overrides, trace), this.liveRequestMonitor, trace);
  }

  public createMessageClassifierService(
    overrides?: ProviderOverrides,
    trace?: RequestTraceContext
  ): MessageClassifierService {
    return new MessageClassifierService(
      this.createAIClientService(overrides, trace),
      this.liveRequestMonitor,
      trace
    );
  }

  private createAIClientService(overrides?: ProviderOverrides, trace?: RequestTraceContext): AIClientService {
    const provider = createProvider(this.config, overrides);
    return new AIClientService(provider, {
      maxRetries: this.config.PROVIDER_MAX_RETRIES,
      retryDelayMs: this.config.PROVIDER_RETRY_DELAY_MS
    }, this.liveRequestMonitor, trace);
  }
}
