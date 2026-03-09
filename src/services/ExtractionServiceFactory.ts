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

export class ExtractionServiceFactory {
  constructor(private readonly config: AppConfig) {}

  public createFactsService(overrides?: ProviderOverrides): FactsExtractionService {
    return new FactsExtractionService(this.createAIClientService(overrides));
  }

  public createIntentService(overrides?: ProviderOverrides): IntentExtractionService {
    return new IntentExtractionService(this.createAIClientService(overrides));
  }

  public createToneService(overrides?: ProviderOverrides): ToneExtractionService {
    return new ToneExtractionService(this.createAIClientService(overrides));
  }

  public createCognitiveService(overrides?: ProviderOverrides): CognitiveExtractionService {
    return new CognitiveExtractionService(this.createAIClientService(overrides));
  }

  public createContextService(overrides?: ProviderOverrides): ContextExtractionService {
    return new ContextExtractionService(this.createAIClientService(overrides));
  }

  public createTopicsService(overrides?: ProviderOverrides): TopicsExtractionService {
    return new TopicsExtractionService(this.createAIClientService(overrides));
  }

  public createOrchestratorService(overrides?: ProviderOverrides): SignalOrchestratorService {
    return new SignalOrchestratorService(
      this.createFactsService(overrides),
      this.createIntentService(overrides),
      this.createToneService(overrides),
      this.createCognitiveService(overrides),
      this.createContextService(overrides),
      this.createTopicsService(overrides)
    );
  }

  public createFullSignalsService(overrides?: ProviderOverrides): FullSignalsExtractionService {
    return new FullSignalsExtractionService(this.createAIClientService(overrides));
  }

  public createMessageClassifierService(overrides?: ProviderOverrides): MessageClassifierService {
    return new MessageClassifierService(this.createAIClientService(overrides));
  }

  private createAIClientService(overrides?: ProviderOverrides): AIClientService {
    const provider = createProvider(this.config, overrides);
    return new AIClientService(provider, {
      maxRetries: this.config.PROVIDER_MAX_RETRIES,
      retryDelayMs: this.config.PROVIDER_RETRY_DELAY_MS
    });
  }
}
