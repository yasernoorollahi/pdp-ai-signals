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
import { LiveRequestMonitor } from '../utils/liveRequestMonitor.js';

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
  public readonly liveRequestMonitor: LiveRequestMonitor;

  constructor() {
    this.config = loadConfig();
    this.liveRequestMonitor = new LiveRequestMonitor();
    const extractionFactory = new ExtractionServiceFactory(this.config, this.liveRequestMonitor);
    this.orchestratorService = extractionFactory.createOrchestratorService();
    this.factsController = new FactsController(extractionFactory, this.liveRequestMonitor);
    this.intentController = new IntentController(extractionFactory, this.liveRequestMonitor);
    this.toneController = new ToneController(extractionFactory, this.liveRequestMonitor);
    this.cognitiveController = new CognitiveController(extractionFactory, this.liveRequestMonitor);
    this.contextController = new ContextController(extractionFactory, this.liveRequestMonitor);
    this.topicsController = new TopicsController(extractionFactory, this.liveRequestMonitor);
    this.healthController = new HealthController();
    this.modelsController = new ModelsController(this.config);
    this.signalsController = new SignalsController(extractionFactory, this.liveRequestMonitor);
    this.messageClassifierController = new MessageClassifierController(extractionFactory, this.liveRequestMonitor);

    this.requestLogger = new RequestLogger(this.liveRequestMonitor);
  }
}
