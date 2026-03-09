import { loadConfig, type AppConfig } from './env.js';
import { SignalOrchestratorService } from '../orchestrator/SignalOrchestratorService.js';
import { FactsController } from '../controllers/FactsController.js';
import { IntentController } from '../controllers/IntentController.js';
import { ToneController } from '../controllers/ToneController.js';
import { CognitiveController } from '../controllers/CognitiveController.js';
import { ContextController } from '../controllers/ContextController.js';
import { TopicsController } from '../controllers/TopicsController.js';
import { HealthController } from '../controllers/HealthController.js';
import { ModelsController } from '../controllers/ModelsController.js';
import { SignalsController } from '../controllers/SignalsController.js';
import { MessageClassifierController } from '../controllers/MessageClassifierController.js';
import { RequestLogger } from '../utils/requestLogger.js';
import { ExtractionServiceFactory } from '../services/ExtractionServiceFactory.js';

export class AppContainer {
  public readonly config: AppConfig;

  public readonly factsController: FactsController;
  public readonly intentController: IntentController;
  public readonly toneController: ToneController;
  public readonly cognitiveController: CognitiveController;
  public readonly contextController: ContextController;
  public readonly topicsController: TopicsController;
  public readonly healthController: HealthController;
  public readonly modelsController: ModelsController;
  public readonly signalsController: SignalsController;
  public readonly messageClassifierController: MessageClassifierController;

  public readonly orchestratorService: SignalOrchestratorService;
  public readonly requestLogger: RequestLogger;

  constructor() {
    this.config = loadConfig();
    const extractionFactory = new ExtractionServiceFactory(this.config);
    this.orchestratorService = extractionFactory.createOrchestratorService();
    this.factsController = new FactsController(extractionFactory);
    this.intentController = new IntentController(extractionFactory);
    this.toneController = new ToneController(extractionFactory);
    this.cognitiveController = new CognitiveController(extractionFactory);
    this.contextController = new ContextController(extractionFactory);
    this.topicsController = new TopicsController(extractionFactory);
    this.healthController = new HealthController();
    this.modelsController = new ModelsController(this.config);
    this.signalsController = new SignalsController(extractionFactory);
    this.messageClassifierController = new MessageClassifierController(extractionFactory);

    this.requestLogger = new RequestLogger();
  }
}
